import axios from 'axios';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const TOKEN_KEY = 'tutela_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Wallet {
  id: string;
  address: string;
  chain: string;
  userId: string;
  createdAt: string;
}

export interface Scan {
  id: string;
  walletId: string;
  txHash: string | null;
  riskScore: number;
  verdict: string;
  reasoning: string | null;
  createdAt: string;
  wallet: { address: string; chain: string };
}

export interface Approval {
  id: string;
  walletId: string;
  spender: string;
  tokenAddress: string;
  amount: string;
  status: string;
  revokeTxHash: string | null;
  detectedAt: string;
  wallet: { address: string; chain: string };
}

export interface Alert {
  id: string;
  walletId: string;
  type: string;
  message: string;
  sent: boolean;
  createdAt: string;
  wallet: { address: string; chain: string };
}

export interface UnsignedTransaction {
  to: string;
  data: string;
  value: string;
}

export async function getWalletChallenge(
  walletAddress: string,
  mode: 'login' | 'register'
): Promise<string> {
  const { data } = await apiClient.post<{ message: string }>('/api/auth/challenge', {
    walletAddress,
    mode,
  });
  return data.message;
}

export async function verifyWallet(message: string, signature: string): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/api/auth/verify', {
    message,
    signature,
  });
  return data.token;
}

export async function authenticateWallet(mode: 'login' | 'register'): Promise<string> {
  if (!window.ethereum) {
    throw new Error('NO_WALLET');
  }

  const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
  const walletAddress = accounts[0];
  if (!walletAddress) {
    throw new Error('NO_ACCOUNT');
  }

  const message = await getWalletChallenge(walletAddress, mode);
  const signature = (await window.ethereum.request({
    method: 'personal_sign',
    params: [message, walletAddress],
  })) as string;

  return verifyWallet(message, signature);
}

export async function listWallets(): Promise<Wallet[]> {
  const { data } = await apiClient.get<Wallet[]>('/api/wallets');
  return data;
}

export async function registerWallet(address: string, chain: string): Promise<Wallet> {
  const { data } = await apiClient.post<Wallet>('/api/wallets', { address, chain });
  return data;
}

export async function deleteWallet(id: string): Promise<void> {
  await apiClient.delete(`/api/wallets/${id}`);
}

export async function listScans(): Promise<Scan[]> {
  const { data } = await apiClient.get<Scan[]>('/api/dashboard/scans');
  return data;
}

export async function listApprovals(): Promise<Approval[]> {
  const { data } = await apiClient.get<Approval[]>('/api/dashboard/approvals');
  return data;
}

export async function listAlerts(): Promise<Alert[]> {
  const { data } = await apiClient.get<Alert[]>('/api/dashboard/alerts');
  return data;
}

export async function prepareRevoke(approvalId: string): Promise<UnsignedTransaction> {
  const { data } = await apiClient.get<UnsignedTransaction>(`/api/actions/revoke/${approvalId}`);
  return data;
}

export async function confirmRevoke(approvalId: string, txHash: string): Promise<Approval> {
  const { data } = await apiClient.post<Approval>(`/api/actions/revoke/${approvalId}/confirm`, {
    txHash,
  });
  return data;
}
