import axios from 'axios';
import { connect, getConnection, signMessage } from 'wagmi/actions';
import { isMobileBrowser, wagmiConfig } from './wagmi';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const AUTH_CHANGE_EVENT = 'tutela-auth-changed';

// The session lives in an httpOnly cookie set by the API, so JavaScript never
// touches the token. The X-Requested-With header is what the API checks on
// state-changing requests to block cross-site form CSRF.
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

apiClient.interceptors.response.use(undefined, (error) => {
  const url: string = error.config?.url ?? '';
  const onAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
  if (error.response?.status === 401 && !url.startsWith('/api/auth/') && !onAuthPage) {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    window.location.replace('/login');
  }
  return Promise.reject(error);
});

export async function hasSession(): Promise<boolean> {
  try {
    await apiClient.get('/api/auth/me');
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export interface Wallet {
  id: string;
  address: string;
  chain: string;
  userId: string;
  createdAt: string;
}

export interface ContractLabel {
  name: string;
  domain: string;
}

export interface Scan {
  id: string;
  walletId: string;
  txHash: string | null;
  spender: string | null;
  spenderLabel: ContractLabel | null;
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
  spenderLabel: ContractLabel | null;
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
  spender: string | null;
  spenderLabel: ContractLabel | null;
  sent: boolean;
  createdAt: string;
  wallet: { address: string; chain: string };
}

export interface UnsignedTransaction {
  to: string;
  data: string;
  value: string;
}

export interface Me {
  id: string;
  walletAddress: string;
  role: string;
  plan: string;
  telegramLinked: boolean;
}

export interface TelegramLinkCode {
  code: string;
  expiresAt: string;
  botUsername?: string;
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

export async function verifyWallet(message: string, signature: string): Promise<void> {
  await apiClient.post('/api/auth/verify', { message, signature });
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

interface ConnectorEmitter {
  on(event: 'message', listener: (payload: { type: string; data?: unknown }) => void): void;
  off(event: 'message', listener: (payload: { type: string; data?: unknown }) => void): void;
}

export async function authenticateWallet(
  mode: 'login' | 'register',
  preferredConnectorId?: 'injected' | 'walletConnect',
  onWalletConnectUri?: (uri: string) => void
): Promise<void> {
  let connection = getConnection(wagmiConfig);

  const needsNewConnection =
    !connection.isConnected ||
    (preferredConnectorId !== undefined && connection.connector?.id !== preferredConnectorId);

  if (needsNewConnection) {
    const hasInjectedWallet = typeof window !== 'undefined' && Boolean(window.ethereum);
    const connectorId = preferredConnectorId ?? (hasInjectedWallet ? 'injected' : 'walletConnect');
    const connector =
      wagmiConfig.connectors.find((candidate) => candidate.id === connectorId) ??
      wagmiConfig.connectors[0];

    if (!connector) {
      throw new Error('NO_WALLET');
    }

    // Only mobile needs our own display_uri handoff — on desktop, WalletConnect's
    // own QR modal already handles this, so leave it as the sole UI there.
    const shouldHandleDisplayUri = Boolean(onWalletConnectUri) && isMobileBrowser();
    const emitter = (connector as unknown as { emitter?: ConnectorEmitter }).emitter;
    const handleMessage = (payload: { type: string; data?: unknown }) => {
      if (payload.type === 'display_uri' && typeof payload.data === 'string') {
        onWalletConnectUri?.(payload.data);
      }
    };

    if (emitter && shouldHandleDisplayUri) {
      emitter.on('message', handleMessage);
    }

    try {
      await connect(wagmiConfig, { connector });
    } finally {
      if (emitter && shouldHandleDisplayUri) {
        emitter.off('message', handleMessage);
      }
    }
    connection = getConnection(wagmiConfig);
  }

  const walletAddress = connection.address;
  if (!walletAddress) {
    throw new Error('NO_ACCOUNT');
  }

  const message = await getWalletChallenge(walletAddress, mode);
  const signature = await signMessage(wagmiConfig, { account: walletAddress, message });

  await verifyWallet(message, signature);
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

export async function getMe(): Promise<Me> {
  const { data } = await apiClient.get<Me>('/api/auth/me');
  return data;
}

export async function getTelegramLinkCode(): Promise<TelegramLinkCode> {
  const { data } = await apiClient.post<TelegramLinkCode>('/api/actions/telegram/link-code');
  return data;
}
