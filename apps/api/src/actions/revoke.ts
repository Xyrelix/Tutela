import { Interface } from 'ethers';

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
