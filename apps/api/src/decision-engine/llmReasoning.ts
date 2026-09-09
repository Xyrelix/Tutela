import Anthropic from '@anthropic-ai/sdk';
import type { RuleResult } from './rules';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system:
      'You are a wallet security analyst. Given an ERC-20 approval event that deterministic rules ' +
      'could not classify confidently, respond with ONLY a JSON object: ' +
      '{"verdict": "safe"|"suspicious"|"malicious", "riskScore": 0-100, "reasoning": "one sentence"}.',
    messages: [
      {
        role: 'user',
        content: JSON.stringify({
          spender: input.spender,
          tokenAddress: input.tokenAddress,
          amount: input.amount,
          contractVerified: input.contractVerified,
          deterministicFindings: input.ruleResult.reasons,
        }),
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '{}';

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
