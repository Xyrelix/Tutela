'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWallet, getToken, listWallets, registerWallet, Wallet } from '@/lib/api-client';

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('ethereum');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    listWallets().then(setWallets).catch(() => setError('Could not load wallets.'));
  }, [router]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const wallet = await registerWallet(address, chain);
      setWallets((prev) => [wallet, ...(prev ?? [])]);
      setAddress('');
    } catch {
      setError('Could not add wallet. Check the address format.');
    }
  }

  async function handleDelete(id: string) {
    await deleteWallet(id);
    setWallets((prev) => (prev ?? []).filter((w) => w.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col gap-8 px-6 py-8">
      <h1 className="text-xl font-semibold">Wallets</h1>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Address</label>
          <input
            required
            placeholder="0x…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-96 rounded border border-black/20 px-3 py-2 font-mono text-sm dark:border-white/20"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-400">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          >
            <option value="ethereum">Ethereum</option>
            <option value="base">Base</option>
          </select>
        </div>
        <button type="submit" className="rounded bg-foreground px-4 py-2 text-background">
          Add wallet
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {wallets === null && <p className="text-sm text-zinc-500">Loading…</p>}
      {wallets?.length === 0 && <p className="text-sm text-zinc-500">No wallets registered yet.</p>}

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {wallets?.map((wallet) => (
          <li key={wallet.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-mono text-sm">{wallet.address}</p>
              <p className="text-xs text-zinc-500">{wallet.chain}</p>
            </div>
            <button onClick={() => handleDelete(wallet.id)} className="text-sm text-red-600 hover:underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
