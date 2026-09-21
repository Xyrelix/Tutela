export const FREE_WALLET_LIMIT = 3;
export const SENTINEL_WALLET_LIMIT = 25;

export function isPro(plan: string): boolean {
  return plan !== 'free';
}

/**
 * Returns the monitored-wallet cap for a plan, or `null` if it's unlimited
 * (Command, or any plan not explicitly capped below).
 */
export function getWalletLimit(plan: string): number | null {
  if (plan === 'free') return FREE_WALLET_LIMIT;
  if (plan === 'sentinel') return SENTINEL_WALLET_LIMIT;
  return null;
}
