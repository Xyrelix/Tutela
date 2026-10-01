import { GoogleGenAI, Type } from '@google/genai';
import type { RuleResult } from './rules';

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const response = await gemini.models.generateContent({
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

  const raw = response.text ?? '{}';

  try {
    const parsed = JSON.parse(raw);
    return {
      verdict: parsed.verdict,
      riskScore: Number(parsed.riskScore),
      reasoning: String(parsed.reasoning),
    };
  } catch {
    return {
      verdict: 'suspicious',
      riskScore: input.ruleResult.riskScore,
      reasoning: 'LLM response could not be parsed; defaulting to suspicious for manual review.',
    };
  }
}
