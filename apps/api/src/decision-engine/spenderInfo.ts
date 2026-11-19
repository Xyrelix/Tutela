import { PUBLIC_RPC_BY_CHAIN } from '../lib/rpc';

// On-chain facts about an approval's spender, fetched from block explorer APIs so the
// LLM judges the spender on evidence rather than on its address alone.

export interface SpenderInfo {
  isContract: boolean;
  verified: boolean | null; // null for wallets (EOAs), which have no source to verify
  contractName: string | null;
  ageDays: number | null;
}

// Per webhook chain: an Etherscan-compatible explorer API, and optionally a JSON-RPC
// endpoint for eth_getCode where the explorer's proxy module isn't available
// (Etherscan's free tier covers only getsourcecode on Arc Mainnet, so contract age
// stays null there). 'ethereum' is the Sepolia webhook. Chains absent here get no lookup.
interface ExplorerConfig {
  api: string;
  keyed: boolean; // Etherscan needs ETHERSCAN_API_KEY; Blockscout is open
  rpc?: string;
}

const EXPLORERS: Record<string, ExplorerConfig> = {
  ethereum: { api: 'https://api.etherscan.io/v2/api?chainid=11155111', keyed: true },
  'arc-testnet': { api: 'https://explorer.testnet.arc.io/api', keyed: false, rpc: PUBLIC_RPC_BY_CHAIN['arc-testnet'] },
  'arc-mainnet': {
    api: 'https://api.etherscan.io/v2/api?chainid=5042',
    keyed: true,
    rpc: PUBLIC_RPC_BY_CHAIN['arc-mainnet'],
  },
};

interface EtherscanResponse<T> {
  status?: string;
  result?: T;
}

async function explorerCall<T>(explorer: ExplorerConfig, params: Record<string, string>): Promise<EtherscanResponse<T>> {
  const url = new URL(explorer.api);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  if (explorer.keyed) {
    url.searchParams.set('apikey', process.env.ETHERSCAN_API_KEY!.trim());
  }
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`Explorer HTTP ${res.status}`);
  }
  return (await res.json()) as EtherscanResponse<T>;
}

async function getCode(explorer: ExplorerConfig, address: string): Promise<unknown> {
  if (!explorer.rpc) {
    return (await explorerCall<string>(explorer, { module: 'proxy', action: 'eth_getCode', address, tag: 'latest' }))
      .result;
  }
  const res = await fetch(explorer.rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [address, 'latest'] }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status}`);
  }
  return ((await res.json()) as { result?: unknown }).result;
}

// Returns null when the lookup can't run or fails; the caller then proceeds without it.
export async function getSpenderInfo(address: string, chain: string): Promise<SpenderInfo | null> {
  const explorer = EXPLORERS[chain];
  if (!explorer || (explorer.keyed && !process.env.ETHERSCAN_API_KEY?.trim())) {
    return null;
  }

  try {
    const code = await getCode(explorer, address);
    if (typeof code !== 'string' || !code.startsWith('0x')) {
      return null;
    }
    if (code === '0x') {
      return { isContract: false, verified: null, contractName: null, ageDays: null };
    }

    const [source, creation] = await Promise.all([
      explorerCall<{ SourceCode: string; ContractName: string }[]>(explorer, {
        module: 'contract',
        action: 'getsourcecode',
        address,
      }),
      explorerCall<{ timestamp?: string }[]>(explorer, {
        module: 'contract',
        action: 'getcontractcreation',
        contractaddresses: address,
      }),
    ]);

    const sourceEntry = source.status === '1' ? source.result?.[0] : undefined;
    const verified = sourceEntry ? Boolean(sourceEntry.SourceCode) : null;
    const createdAt = Number(creation.status === '1' ? creation.result?.[0]?.timestamp : NaN);

    return {
      isContract: true,
      verified,
      contractName: verified && sourceEntry ? sourceEntry.ContractName || null : null,
      ageDays: Number.isFinite(createdAt) ? Math.floor((Date.now() / 1000 - createdAt) / 86_400) : null,
    };
  } catch (err) {
    console.error(`[spenderInfo] explorer lookup failed for ${address}`, err);
    return null;
  }
}
