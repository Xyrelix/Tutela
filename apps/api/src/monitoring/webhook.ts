import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { id as keccakId } from 'ethers';
import { prisma } from '../db/client';
import { evaluateApproval, Verdict } from '../decision-engine/rules';
import { reasonAboutApproval } from '../decision-engine/llmReasoning';
import { asyncHandler } from '../lib/asyncHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

const router = Router();

const APPROVAL_TOPIC = keccakId('Approval(address,address,uint256)');

interface AlchemyActivity {
  fromAddress: string;
  rawContract: { address: string };
  log?: {
    topics: string[];
    data: string;
  };
}

interface AlchemyWebhookPayload {
  webhookId: string;
  event: {
    activity: AlchemyActivity[];
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

    const payload = req.body as AlchemyWebhookPayload;
    const activities = payload.event?.activity ?? [];

    for (const activity of activities) {
      const topics = activity.log?.topics ?? [];
      if (topics[0] !== APPROVAL_TOPIC || topics.length < 3) {
        continue;
      }

      const wallet = await prisma.wallet.findFirst({
        where: { address: { equals: activity.fromAddress, mode: 'insensitive' } },
      });
      if (!wallet) {
        continue;
      }

      const spender = `0x${topics[2].slice(-40)}`;
      const amount = BigInt(activity.log?.data ?? '0x0').toString();

      const ruleResult = evaluateApproval({
        spender,
        tokenAddress: activity.rawContract.address,
        amount,
      });

      let verdict: Verdict = ruleResult.verdict;
      let riskScore = ruleResult.riskScore;
      let reasoning = ruleResult.reasons.join('; ');

      if (ruleResult.verdict === 'ambiguous') {
        const llmVerdict = await reasonAboutApproval({
          spender,
          tokenAddress: activity.rawContract.address,
          amount,
          contractVerified: null,
          ruleResult,
        });
        verdict = llmVerdict.verdict;
        riskScore = llmVerdict.riskScore;
        reasoning = llmVerdict.reasoning;
      }

      await prisma.scan.create({
        data: { walletId: wallet.id, riskScore, verdict, reasoning },
      });

      if (verdict !== 'safe') {
        await prisma.approval.create({
          data: { walletId: wallet.id, spender, tokenAddress: activity.rawContract.address, amount },
        });

        await prisma.alert.create({
          data: {
            walletId: wallet.id,
            type: verdict === 'malicious' ? 'drainer_contract' : 'risky_approval',
            message: reasoning,
          },
        });
      }
    }

    res.status(200).json({ received: true });
  })
);

export default router;
