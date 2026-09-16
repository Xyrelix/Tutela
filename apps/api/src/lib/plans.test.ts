import { isPro } from './plans';

describe('isPro', () => {
  it('treats the free plan as not pro', () => {
    expect(isPro('free')).toBe(false);
  });

  it('treats any other plan value as pro', () => {
    expect(isPro('pro')).toBe(true);
    expect(isPro('enterprise')).toBe(true);
  });
});
