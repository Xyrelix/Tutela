// On-chain facts about an approval's spender, fetched from Etherscan's V2 API so the
// LLM judges the spender on evidence rather than on its address alone.

export interface SpenderInfo {
  isContract: boolean;
  verified: boolean | null; // null for wallets (EOAs), which have no source to verify
  contractName: string | null;
  ageDays: number | null;
}

// Webhook chain name -> Etherscan chain id. 'ethereum' is the Sepolia webhook;
// chains Etherscan doesn't index are simply absent and get no lookup.
const ETHERSCAN_CHAIN_IDS: Record<string, number> = {
  ethereum: 11155111,
};

interface EtherscanResponse<T> {
  status?: string;
  result?: T;
}

async function etherscan<T>(chainId: number, params: Record<string, string>): Promise<EtherscanResponse<T>> {
  const url = new URL('https://api.etherscan.io/v2/api');
  url.search = new URLSearchParams({
    chainid: String(chainId),
    apikey: process.env.ETHERSCAN_API_KEY!.trim(),
    ...params,
  }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`Etherscan HTTP ${res.status}`);
  }
  return (await res.json()) as EtherscanResponse<T>;
}

// Returns null when the lookup can't run or fails; the caller then proceeds without it.
export async function getSpenderInfo(address: string, chain: string): Promise<SpenderInfo | null> {
  const chainId = ETHERSCAN_CHAIN_IDS[chain];
  if (!chainId || !process.env.ETHERSCAN_API_KEY?.trim()) {
    return null;
  }

  try {
    const code = await etherscan<string>(chainId, { module: 'proxy', action: 'eth_getCode', address, tag: 'latest' });
    if (typeof code.result !== 'string' || !code.result.startsWith('0x')) {
      return null;
    }
    if (code.result === '0x') {
      return { isContract: false, verified: null, contractName: null, ageDays: null };
    }

    const [source, creation] = await Promise.all([
      etherscan<{ SourceCode: string; ContractName: string }[]>(chainId, {
        module: 'contract',
        action: 'getsourcecode',
        address,
      }),
      etherscan<{ timestamp?: string }[]>(chainId, {
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
    console.error(`[spenderInfo] Etherscan lookup failed for ${address}`, err);
    return null;
  }
}
