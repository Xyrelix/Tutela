import { GoogleGenAI, Type } from '@google/genai';
import type { RuleResult } from './rules';
import type { SpenderInfo } from './spenderInfo';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({ apiKey });
}

export interface AmbiguousCaseInput {
  spender: string;
  tokenAddress: string;
  amount: string;
  spenderInfo: SpenderInfo | null;
  ruleResult: RuleResult;
}

export interface LlmVerdict {
  verdict: 'safe' | 'suspicious' | 'malicious';
  riskScore: number;
  reasoning: string;
}

export async function reasonAboutApproval(input: AmbiguousCaseInput): Promise<LlmVerdict> {
  const fallback: LlmVerdict = {
    verdict: 'suspicious',
    riskScore: input.ruleResult.riskScore,
    reasoning: 'AI risk analysis was unavailable; defaulting to suspicious for manual review.',
  };

  // Free-tier models return 503 under high demand; wait and switch models before giving up.
  const attempts = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
  for (const [i, model] of attempts.entries()) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, i * 3000));
    try {
      const response = await getGeminiClient().models.generateContent({
        model,
        contents: JSON.stringify({
          spender: input.spender,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
          spenderInfo: input.spenderInfo,
          deterministicFindings: input.ruleResult.reasons,
        }),
        config: {
          systemInstruction:
            'You are a wallet security analyst. Given an ERC-20 approval event that deterministic ' +
            'rules could not classify confidently, decide whether it is safe, suspicious, or malicious. ' +
            'spenderInfo holds on-chain facts from Etherscan (null if the lookup failed): whether the spender ' +
            'is a contract or a plain wallet, whether its source is verified, its name, and its age in days. ' +
            'Unlimited approvals to plain wallets, or to new unverified contracts, are classic drainer patterns.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ['safe', 'suspicious', 'malicious'] },
              riskScore: {
                type: Type.INTEGER,
                minimum: 0,
                maximum: 100,
                description: 'Whole number from 0 (no risk) to 100 (certain drainer)',
              },
              reasoning: { type: Type.STRING },
            },
            required: ['verdict', 'riskScore', 'reasoning'],
          },
        },
      });

      const parsed: unknown = JSON.parse(response.text ?? '{}');
      if (typeof parsed !== 'object' || parsed === null) {
        return fallback;
      }

      const result = parsed as Record<string, unknown>;
      // Scan.riskScore is an Int column; a fractional score would fail the insert.
      const riskScore = Math.round(Number(result.riskScore));
      if (
        !['safe', 'suspicious', 'malicious'].includes(String(result.verdict)) ||
        !Number.isFinite(riskScore) ||
        riskScore < 0 ||
        riskScore > 100 ||
        typeof result.reasoning !== 'string' ||
        result.reasoning.trim().length === 0
      ) {
        return fallback;
      }

      return {
        verdict: result.verdict as LlmVerdict['verdict'],
        riskScore,
        reasoning: result.reasoning,
      };
    } catch (err) {
      console.error(`[llmReasoning] Gemini reasoning failed on ${model} (attempt ${i + 1})`, err);
    }
  }
  return fallback;
}
