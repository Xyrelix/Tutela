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

// Alchemy issues a separate signing key per webhook, so ALCHEMY_WEBHOOK_SIGNING_KEY
// can hold several comma-separated keys (one per network's webhook).
function verifySignature(req: Request): boolean {
  const signature = req.header('x-alchemy-signature');
  const signingKeys = (process.env.ALCHEMY_WEBHOOK_SIGNING_KEY ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
  const body = req.rawBody;
  if (!signature || signingKeys.length === 0 || !body) {
    return false;
  }

  const signatureBuf = Buffer.from(signature);
  return signingKeys.some((signingKey) => {
    const expectedBuf = Buffer.from(crypto.createHmac('sha256', signingKey).update(body, 'utf8').digest('hex'));
    return expectedBuf.length === signatureBuf.length && crypto.timingSafeEqual(expectedBuf, signatureBuf);
  });
}

// Each Alchemy webhook covers one network. The network is set on the webhook URL
// as ?chain=<name>, so events can be matched to the right wallet record.
// Without it, events are treated as Ethereum (the original Sepolia webhook).
const SUPPORTED_CHAINS = ['ethereum', 'robinhood-testnet'];

router.post(
  '/alchemy',
  asyncHandler(async (req: Request, res: Response) => {
    if (!verifySignature(req)) {
      res.status(401).json({ error: 'Invalid webhook signature' });
      return;
    }

    const chainParam = typeof req.query.chain === 'string' ? req.query.chain : 'ethereum';
    if (!SUPPORTED_CHAINS.includes(chainParam)) {
      res.status(400).json({ error: `Unsupported chain: ${chainParam}` });
      return;
    }

    const payload = req.body as AlchemyGraphqlWebhookPayload;
    const logs = payload.event?.data?.block?.logs ?? [];

    // Acknowledge first: Alchemy pauses webhooks after repeated slow or failed
    // responses, and the LLM call plus cold starts can exceed its timeout.
    res.status(200).json({ received: true });
    processLogs(logs, chainParam).catch((err) => console.error('[webhook] failed to process logs', err));
  })
);

async function processLogs(logs: AlchemyGraphqlLog[], chain: string): Promise<void> {
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
        where: { address: { equals: walletAddress, mode: 'insensitive' }, chain },
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
        data: { walletId: wallet.id, txHash: log.transaction.hash, spender, riskScore, verdict, reasoning },
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
            spender,
          },
        });

        await dispatchAlert(alert.id);
      }
  }
}

export default router;
