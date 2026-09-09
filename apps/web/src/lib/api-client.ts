import axios from 'axios';

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

export async function login(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/api/auth/login', { email, password });
  return data.token;
}

export async function register(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/api/auth/register', { email, password });
  return data.token;
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
