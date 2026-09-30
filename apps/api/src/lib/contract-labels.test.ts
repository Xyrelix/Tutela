import { getContractLabel } from './contract-labels';

describe('getContractLabel', () => {
  it('recognizes a known contract regardless of address casing', () => {
    const lower = getContractLabel('0x7a250d5630b4cf539739df2c5dacb4c659f2488d');
    const upper = getContractLabel('0x7A250d5630B4cF539739dF2C5dAcb4c659F2488D');

    expect(lower).toEqual({ name: 'Uniswap V2 Router', domain: 'uniswap.org' });
    expect(upper).toEqual(lower);
  });

  it('returns null for an address not in the curated list', () => {
    expect(getContractLabel('0x000000000000000000000000000000deadbeef')).toBeNull();
  });
});
