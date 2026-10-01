export function shortAddress(address: string): string {
  if (address.includes('...')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
