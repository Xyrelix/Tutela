import { FREE_WALLET_LIMIT, SENTINEL_WALLET_LIMIT, getWalletLimit, isPro } from './plans';

describe('isPro', () => {
  it('treats the free plan as not pro', () => {
    expect(isPro('free')).toBe(false);
  });

  it('treats any other plan value as pro', () => {
    expect(isPro('pro')).toBe(true);
    expect(isPro('enterprise')).toBe(true);
  });
});

describe('getWalletLimit', () => {
  it('caps the free plan at FREE_WALLET_LIMIT', () => {
    expect(getWalletLimit('free')).toBe(FREE_WALLET_LIMIT);
  });

  it('caps the sentinel plan at SENTINEL_WALLET_LIMIT', () => {
    expect(getWalletLimit('sentinel')).toBe(SENTINEL_WALLET_LIMIT);
  });

  it('treats command and any other plan as unlimited', () => {
    expect(getWalletLimit('command')).toBeNull();
    expect(getWalletLimit('enterprise')).toBeNull();
  });
});
