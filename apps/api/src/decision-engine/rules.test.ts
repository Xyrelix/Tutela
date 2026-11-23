import { getAddress, MaxUint256 } from 'ethers';
import { evaluateApproval } from './rules';
import knownDrainers from './known-drainers.json';

const SAFE_SPENDER = '0x9999999999999999999999999999999999999999';
const SAFE_TOKEN = '0x8888888888888888888888888888888888888888';
const DRAINER = knownDrainers[0];

describe('evaluateApproval', () => {
  it('flags a known drainer address as malicious regardless of amount', () => {
    const result = evaluateApproval({
      spender: DRAINER,
      tokenAddress: SAFE_TOKEN,
      amount: '1',
    });

    expect(result).toEqual({
      verdict: 'malicious',
      riskScore: 100,
      reasons: ['Spender matches known drainer contract list'],
    });
  });

  it('matches a known drainer address regardless of input casing', () => {
    const checksummed = getAddress(DRAINER);
    const result = evaluateApproval({
      spender: checksummed,
      tokenAddress: SAFE_TOKEN,
      amount: '1',
    });

    expect(result.verdict).toBe('malicious');
  });

  it('flags an unlimited (MaxUint256) approval from an unknown spender as ambiguous', () => {
    const result = evaluateApproval({
      spender: SAFE_SPENDER,
      tokenAddress: SAFE_TOKEN,
      amount: MaxUint256.toString(),
    });

    expect(result).toEqual({
      verdict: 'ambiguous',
      riskScore: 40,
      reasons: ['Unlimited (MaxUint256) approval amount'],
    });
  });

  it('treats a bounded approval from an unknown spender as safe', () => {
    const result = evaluateApproval({
      spender: SAFE_SPENDER,
      tokenAddress: SAFE_TOKEN,
      amount: '1000000',
    });

    expect(result).toEqual({
      verdict: 'safe',
      riskScore: 0,
      reasons: ['No known risk indicators'],
    });
  });

  it('flags an amount one wei short of MaxUint256 as effectively unlimited', () => {
    const almostMax = (MaxUint256 - 1n).toString();
    const result = evaluateApproval({
      spender: SAFE_SPENDER,
      tokenAddress: SAFE_TOKEN,
      amount: almostMax,
    });

    expect(result.verdict).toBe('ambiguous');
    expect(result.riskScore).toBe(40);
    expect(result.reasons[0]).toContain('Effectively unlimited');
  });

  it('flags amounts from 2^128 up as effectively unlimited, and keeps just below it bounded', () => {
    const at = evaluateApproval({ spender: SAFE_SPENDER, tokenAddress: SAFE_TOKEN, amount: (2n ** 128n).toString() });
    const below = evaluateApproval({
      spender: SAFE_SPENDER,
      tokenAddress: SAFE_TOKEN,
      amount: (2n ** 128n - 1n).toString(),
    });

    expect(at.verdict).toBe('ambiguous');
    expect(below.verdict).toBe('safe');
  });

  it('keeps a large but realistic approval (1 billion tokens at 18 decimals) bounded', () => {
    const result = evaluateApproval({
      spender: SAFE_SPENDER,
      tokenAddress: SAFE_TOKEN,
      amount: (10n ** 27n).toString(),
    });

    expect(result.verdict).toBe('safe');
  });

  it('treats an unlimited approval to a known protocol contract as safe', () => {
    const result = evaluateApproval({
      spender: '0x000000000022D473030F116dDEE9F6B43aC78BA3', // Uniswap Permit2, checksummed
      tokenAddress: SAFE_TOKEN,
      amount: MaxUint256.toString(),
    });

    expect(result.verdict).toBe('safe');
    expect(result.reasons[0]).toContain('Uniswap Permit2');
  });
});
