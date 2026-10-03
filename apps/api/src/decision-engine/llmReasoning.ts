import { GoogleGenAI, Type } from '@google/genai';
import type { RuleResult } from './rules';

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
  contractVerified: boolean | null;
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

  try {
    const response = await getGeminiClient().models.generateContent({
      model: 'gemini-flash-latest',
      contents: JSON.stringify({
        spender: input.spender,
        tokenAddress: input.tokenAddress,
        amount: input.amount,
        contractVerified: input.contractVerified,
        deterministicFindings: input.ruleResult.reasons,
      }),
      config: {
        systemInstruction:
          'You are a wallet security analyst. Given an ERC-20 approval event that deterministic ' +
          'rules could not classify confidently, decide whether it is safe, suspicious, or malicious.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ['safe', 'suspicious', 'malicious'] },
            riskScore: { type: Type.NUMBER },
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
    const riskScore = Number(result.riskScore);
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
  } catch {
    return fallback;
  }
}
