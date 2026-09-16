import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db/client';
import { evaluateApproval, Verdict } from '../decision-engine/rules';
import { reasonAboutApproval } from '../decision-engine/llmReasoning';
import { dispatchAlert } from '../actions/alerts';
import { asyncHandler } from '../lib/asyncHandler';
import { isPro } from '../lib/plans';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

const router = Router();

// Matches the GraphQL query configured on the Alchemy Custom Webhook:
//   { block { logs(filter: { topics: [...] }) { topics data account { address } transaction { hash from { address } } } } }
interface AlchemyGraphqlLog {
  topics: string[];
  data: string;
  account: { address: string };
  transaction: { hash: string; from: { address: string } };
}

interface AlchemyGraphqlWebhookPayload {
  webhookId: string;
  event?: {
    data?: {
      block?: {
        logs?: AlchemyGraphqlLog[];
      };
    };
  };
}

function verifySignature(req: Request): boolean {
  const signature = req.header('x-alchemy-signature');
  const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY;
  if (!signature || !signingKey || !req.rawBody) {
    return false;
  }

  const expected = crypto.createHmac('sha256', signingKey).update(req.rawBody, 'utf8').digest('hex');
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);

  return expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

router.post(
  '/alchemy',
  asyncHandler(async (req: Request, res: Response) => {
    if (!verifySignature(req)) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const payload = req.body as AlchemyGraphqlWebhookPayload;
    const logs = payload.event?.data?.block?.logs ?? [];

    for (const log of logs) {
      const topics = log.topics ?? [];
      if (topics.length < 3) {
        continue;
      }

      const walletAddress = log.transaction?.from?.address;
      if (!walletAddress) {
        continue;
      }

      const wallet = await prisma.wallet.findFirst({
        where: { address: { equals: walletAddress, mode: 'insensitive' } },
        include: { user: true },
      });
      if (!wallet) {
        continue;
      }

      const spender = `0x${topics[2].slice(-40)}`;
      const tokenAddress = log.account.address;
      const amount = BigInt(log.data ?? '0x0').toString();

      const ruleResult = evaluateApproval({ spender, tokenAddress, amount });

      let verdict: Verdict = ruleResult.verdict;
      let riskScore = ruleResult.riskScore;
      let reasoning = ruleResult.reasons.join('; ');

      if (ruleResult.verdict === 'ambiguous') {
        if (isPro(wallet.user.plan)) {
          const llmVerdict = await reasonAboutApproval({
            spender,
            tokenAddress,
            amount,
            contractVerified: null,
            ruleResult,
          });
          verdict = llmVerdict.verdict;
          riskScore = llmVerdict.riskScore;
          reasoning = llmVerdict.reasoning;
        } else {
          verdict = 'suspicious';
          riskScore = 60;
          reasoning =
            'Ambiguous case could not be auto-cleared by rules alone — upgrade to Pro for AI-powered risk analysis on cases like this.';
        }
      }

      await prisma.scan.create({
        data: { walletId: wallet.id, txHash: log.transaction.hash, riskScore, verdict, reasoning },
      });

      if (verdict !== 'safe') {
        await prisma.approval.create({
          data: { walletId: wallet.id, spender, tokenAddress, amount },
        });

        const alert = await prisma.alert.create({
          data: {
            walletId: wallet.id,
            type: verdict === 'malicious' ? 'drainer_contract' : 'risky_approval',
            message: reasoning,
          },
        });

        await dispatchAlert(alert.id);
      }
    }

    res.status(200).json({ received: true });
  })
);

export default router;
