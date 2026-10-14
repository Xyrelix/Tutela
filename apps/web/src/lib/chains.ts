export const CHAIN_META: Record<string, { label: string; color: string; mark: string; explorer: string }> = {
  ethereum: { label: 'Ethereum', color: '#8b9eff', mark: 'Ξ', explorer: 'https://etherscan.io' },
  base: { label: 'Base', color: '#6dce9a', mark: 'B', explorer: 'https://basescan.org' },
  'robinhood-testnet': {
    label: 'Robinhood Testnet',
    color: '#ffb15c',
    mark: 'R',
    explorer: 'https://explorer.testnet.chain.robinhood.com',
  },
};

const DEFAULT_EXPLORER = CHAIN_META.ethereum.explorer;

export function explorerAddressUrl(chain: string, address: string): string {
  return `${CHAIN_META[chain]?.explorer ?? DEFAULT_EXPLORER}/address/${address}`;
}

export function explorerTxUrl(chain: string, txHash: string): string {
  return `${CHAIN_META[chain]?.explorer ?? DEFAULT_EXPLORER}/tx/${txHash}`;
}
