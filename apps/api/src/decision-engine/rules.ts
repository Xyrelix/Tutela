import { MaxUint256 } from 'ethers';
import knownDrainers from './known-drainers.json';
import { getContractLabel } from '../lib/contract-labels';

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

// Drainers dodge exact-MaxUint256 checks with amounts like MaxUint256 - 1. Anything at or
// above 2^128 (~3.4e38 base units) exceeds any real token supply, so it is unlimited in effect.
// ponytail: fixed threshold; comparing against the token's totalSupply would catch smaller
// drain-sized amounts but needs an RPC call per approval.
const EFFECTIVELY_UNLIMITED = 2n ** 128n;

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

  // Known protocol spenders (Uniswap, OpenSea, ...) routinely get unlimited approvals;
  // clearing them here keeps normal activity out of the alert feed and the LLM quota.
  const label = getContractLabel(spender);
  if (label) {
    return {
      verdict: 'safe',
      riskScore: 0,
      reasons: [`Spender is ${label.name} (${label.domain}), a known protocol contract`],
    };
  }

  const reasons: string[] = [];
  let riskScore = 0;

  const amount = BigInt(input.amount);
  if (amount === MaxUint256) {
    riskScore += 40;
    reasons.push('Unlimited (MaxUint256) approval amount');
  } else if (amount >= EFFECTIVELY_UNLIMITED) {
    riskScore += 40;
    reasons.push('Effectively unlimited approval amount (just under MaxUint256 or above any real token supply)');
  }

  if (riskScore === 0) {
    return { verdict: 'safe', riskScore, reasons: ['No known risk indicators'] };
  }

  if (riskScore >= 70) {
    return { verdict: 'suspicious', riskScore, reasons };
  }

  return { verdict: 'ambiguous', riskScore, reasons };
}
