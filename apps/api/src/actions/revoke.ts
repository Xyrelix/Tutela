import { Interface, JsonRpcProvider } from 'ethers';

const ERC20_APPROVE_ABI = ['function approve(address spender, uint256 amount) returns (bool)'];
const erc20Interface = new Interface(ERC20_APPROVE_ABI);

export interface UnsignedTransaction {
  to: string;
  data: string;
  value: string;
}

export function buildRevokeTransaction(tokenAddress: string, spender: string): UnsignedTransaction {
  const data = erc20Interface.encodeFunctionData('approve', [spender, 0n]);
  return { to: tokenAddress, data, value: '0x0' };
}

// ponytail: Sepolia-only RPC; make it chain-aware when mainnet monitoring lands
function revokeProvider(): JsonRpcProvider {
  return new JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
}

// Returns a reason the transaction doesn't prove a successful revoke, or null if it does.
export async function verifyRevokeTransaction(
  txHash: string,
  approval: { tokenAddress: string; spender: string; wallet: { address: string } }
): Promise<string | null> {
  const provider = revokeProvider();
  const [tx, receipt] = await Promise.all([provider.getTransaction(txHash), provider.getTransactionReceipt(txHash)]);
  if (!tx || !receipt) return 'Transaction is not confirmed yet';
  if (receipt.status !== 1) return 'Transaction failed on-chain';

  const expected = buildRevokeTransaction(approval.tokenAddress, approval.spender);
  if (tx.to?.toLowerCase() !== expected.to.toLowerCase()) return 'Transaction targets a different contract';
  if (tx.from.toLowerCase() !== approval.wallet.address.toLowerCase()) return 'Transaction was not sent from the approval wallet';
  if (tx.data.toLowerCase() !== expected.data.toLowerCase()) return 'Transaction does not revoke this approval';
  return null;
}
