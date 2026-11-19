// Official public RPCs for chains Tutela doesn't reach through Alchemy.
// ponytail: shared public endpoints; move to Alchemy (arc-testnet/arc-mainnet.g.alchemy.com)
// once those networks are enabled on the Alchemy app, if rate limits bite.
export const PUBLIC_RPC_BY_CHAIN: Record<string, string> = {
  'arc-testnet': 'https://rpc.testnet.arc.io',
  'arc-mainnet': 'https://rpc.mainnet.arc.io',
};
