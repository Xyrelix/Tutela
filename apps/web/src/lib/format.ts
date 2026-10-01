export function shortAddress(address: string): string {
  if (address.includes('...')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Approval amounts are raw base-unit integers straight off-chain (no
// decimals applied, since we don't look up the token's decimals), so a
// normal-looking approval can still be a 20+ digit string. Truncate as a
// safety net so one never breaks the layout the way the unlimited case did.
export function formatAmount(amount: string): string {
  if (amount.length <= 12) return amount;
  return `${amount.slice(0, 6)}…${amount.slice(-4)}`;
}
