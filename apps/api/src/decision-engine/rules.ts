import { MaxUint256 } from 'ethers';
import knownDrainers from './known-drainers.json';

export type Verdict = 'safe' | 'suspicious' | 'malicious' | 'ambiguous';

export interface RuleInput {
  spender: string;
  tokenAddress: string;
  amount: string;
}

export interface RuleResult {
  verdict: Verdict;
  riskScore: number;
  reasons: string[];
}

const DRAINER_SET = new Set((knownDrainers as string[]).map((address) => address.toLowerCase()));

export function evaluateApproval(input: RuleInput): RuleResult {
  const spender = input.spender.toLowerCase();

  if (DRAINER_SET.has(spender)) {
    return {
      verdict: 'malicious',
      riskScore: 100,
      reasons: ['Spender matches known drainer contract list'],
    };
  }

  const reasons: string[] = [];
  let riskScore = 0;

  const isUnlimited = input.amount === MaxUint256.toString();
  if (isUnlimited) {
    riskScore += 40;
    reasons.push('Unlimited (MaxUint256) approval amount');
  }

  if (riskScore === 0) {
    return { verdict: 'safe', riskScore, reasons: ['No known risk indicators'] };
  }

  if (riskScore >= 70) {
    return { verdict: 'suspicious', riskScore, reasons };
  }

  return { verdict: 'ambiguous', riskScore, reasons };
}
