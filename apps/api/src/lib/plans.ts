export const FREE_WALLET_LIMIT = 3;

export function isPro(plan: string): boolean {
  return plan !== 'free';
}
