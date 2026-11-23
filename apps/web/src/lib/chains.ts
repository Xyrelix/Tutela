interface ChainMeta {
  label: string;
  color: string;
  mark: string;
  explorer: string;
  // For switching the wallet before a revoke; `add` is offered to wallets that
  // don't know the chain yet. Only Arc and Base set this; other chains revoke as before.
  network?: {
    chainId: number;
    add?: {
      chainName: string;
      nativeCurrency: { name: string; symbol: string; decimals: number };
      rpcUrls: string[];
      blockExplorerUrls: string[];
    };
  };
}

export const CHAIN_META: Record<string, ChainMeta> = {
  ethereum: { label: 'Ethereum', color: '#8b9eff', mark: 'Ξ', explorer: 'https://sepolia.etherscan.io' },
  // Monitored on Base Sepolia, like 'ethereum' is on Sepolia.
  base: {
    label: 'Base',
    color: '#6dce9a',
    mark: 'B',
    explorer: 'https://sepolia.basescan.org',
    network: {
      chainId: 84532,
      add: {
        chainName: 'Base Sepolia',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.base.org'],
        blockExplorerUrls: ['https://sepolia.basescan.org'],
      },
    },
  },
  'robinhood-testnet': {
    label: 'Robinhood Testnet',
    color: '#ffb15c',
    mark: 'R',
    explorer: 'https://explorer.testnet.chain.robinhood.com',
  },
  'arc-testnet': {
    label: 'Arc Testnet',
    color: '#7fd8e8',
    mark: 'A',
    explorer: 'https://explorer.testnet.arc.io',
    network: {
      chainId: 5042002,
      add: {
        chainName: 'Arc Testnet',
        // Arc's native gas token is USDC, with 18 decimals at the native level.
        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
        rpcUrls: ['https://rpc.testnet.arc.io'],
        blockExplorerUrls: ['https://explorer.testnet.arc.io'],
      },
    },
  },
  'arc-mainnet': {
    label: 'Arc',
    color: '#3ec5e0',
    mark: 'A',
    explorer: 'https://explorer.arc.io',
    network: {
      chainId: 5042,
      add: {
        chainName: 'Arc',
        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
        rpcUrls: ['https://rpc.mainnet.arc.io'],
        blockExplorerUrls: ['https://explorer.arc.io'],
      },
    },
  },
};

const DEFAULT_EXPLORER = CHAIN_META.ethereum.explorer;

export function explorerAddressUrl(chain: string, address: string): string {
  return `${CHAIN_META[chain]?.explorer ?? DEFAULT_EXPLORER}/address/${address}`;
}

export function explorerTxUrl(chain: string, txHash: string): string {
  return `${CHAIN_META[chain]?.explorer ?? DEFAULT_EXPLORER}/tx/${txHash}`;
}

// Moves the browser wallet onto the wallet record's chain, adding it first if the
// wallet doesn't know it (EIP-3085 error 4902). Chains without `network` are left as-is.
export async function switchWalletToChain(chain: string): Promise<void> {
  const network = CHAIN_META[chain]?.network;
  if (!network || !window.ethereum) return;
  const chainId = `0x${network.chainId.toString(16)}`;
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
  } catch (err) {
    if ((err as { code?: number }).code !== 4902 || !network.add) throw err;
    await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId, ...network.add }] });
  }
}
