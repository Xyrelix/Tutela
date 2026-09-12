'use client';

import { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { deleteWallet, Wallet } from '@/lib/api-client';

function randomAddress() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function createMockWallet(chain: string, id: string): Wallet {
  return {
    id,
    address: randomAddress(),
    chain,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
  };
}

const INITIAL_MOCK_WALLETS: Wallet[] = [
  {
    id: 'mock-alex',
    address: '0x71C7...4A2E',
    chain: 'ethereum',
    userId: 'mock-user',
    createdAt: '2026-09-10T09:41:00.000Z',
  },
  {
    id: 'mock-treasury',
    address: '0x8B2F...91C0',
    chain: 'base',
    userId: 'mock-user',
    createdAt: '2026-09-08T14:12:00.000Z',
  },
  {
    id: 'mock-vault',
    address: '0x4D90...C81B',
    chain: 'ethereum',
    userId: 'mock-user',
    createdAt: '2026-09-04T11:27:00.000Z',
  },
];

const CHAIN_META: Record<string, { label: string; color: string; mark: string }> = {
  ethereum: { label: 'Ethereum', color: '#8b9eff', mark: 'Ξ' },
  base: { label: 'Base', color: '#6dce9a', mark: 'B' },
};

function shortAddress(address: string) {
  if (address.includes('...')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>(INITIAL_MOCK_WALLETS);
  const [query, setQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredWallets = wallets.filter((wallet) => {
    const matchesChain = chainFilter === 'all' || wallet.chain === chainFilter;
    const matchesQuery = `${wallet.address} ${wallet.chain}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesChain && matchesQuery;
  });

  function handleMockConnect() {
    const nextWallet = createMockWallet('base', `mock-${Date.now()}`);
    setWallets((current) => [nextWallet, ...current]);
    setModalOpen(false);
    setNotice('Demo wallet connected and monitoring is ready.');
  }

  async function handleDelete(wallet: Wallet) {
    if (!wallet.id.startsWith('mock-')) await deleteWallet(wallet.id);
    setWallets((current) => current.filter((item) => item.id !== wallet.id));
    setNotice('Wallet removed from monitoring.');
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address);
    setCopied(address);
    window.setTimeout(() => setCopied(null), 1600);
  }

  const chains = new Set(wallets.map((wallet) => wallet.chain)).size;

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" />
              Protection console
            </div>
            <h1 className="font-sans text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              Your wallets,
              <br />
              <span className="text-white/40">under watch.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
              Tutela monitors the wallets that matter and turns on-chain noise into decisions you
              can trust.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2457ff] px-5 py-3 text-sm font-medium shadow-[0_0_30px_rgba(36,87,255,0.2)] transition-transform hover:scale-[1.02]"
          >
            <WalletCards className="h-4 w-4" />
            Connect a wallet
          </button>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {[
            [
              'Wallets protected',
              wallets.length.toString().padStart(2, '0'),
              'All systems monitored',
              ShieldCheck,
            ],
            ['Networks active', chains.toString().padStart(2, '0'), 'Ethereum + Base', Activity],
            ['Protection status', 'Good', 'No urgent action needed', Sparkles],
          ].map(([label, value, detail, Icon]) => (
            <div key={label as string} className="bg-[#101217] p-6 sm:p-7">
              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>{label as string}</span>
                <Icon className="h-4 w-4 text-[#6dce9a]" />
              </div>
              <p className="mt-5 text-3xl font-medium tracking-[-0.05em] text-white">
                {value as string}
              </p>
              <p className="mt-2 text-xs text-[#6dce9a]/80">{detail as string}</p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-medium tracking-[-0.03em]">Monitored wallets</h2>
              <p className="mt-1 text-xs text-white/35">
                Every address gets a continuous risk watch.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/35">
                <Search className="h-3.5 w-3.5" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search wallets"
                  className="w-28 bg-transparent text-white outline-none placeholder:text-white/25"
                />
              </label>
              <select
                value={chainFilter}
                onChange={(event) => setChainFilter(event.target.value)}
                className="h-9 rounded-lg border border-white/10 bg-[#101217] px-3 text-xs text-white/60 outline-none"
              >
                <option value="all">All networks</option>
                <option value="ethereum">Ethereum</option>
                <option value="base">Base</option>
              </select>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101217]">
            {filteredWallets.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-white/60">No wallets match this view.</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-4 text-xs text-[#6dce9a] hover:underline"
                >
                  Connect a wallet
                </button>
              </div>
            ) : (
              filteredWallets.map((wallet, index) => {
                const meta = CHAIN_META[wallet.chain] ?? CHAIN_META.ethereum;
                return (
                  <div
                    key={wallet.id}
                    className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${index ? 'border-t border-white/[0.07]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold"
                        style={{ color: meta.color }}
                      >
                        {meta.mark}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-white">
                            {shortAddress(wallet.address)}
                          </p>
                          <span className="rounded-full bg-[#6dce9a]/10 px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#6dce9a] uppercase">
                            Protected
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-white/35">
                          {meta.label} · Added{' '}
                          {new Date(wallet.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => copyAddress(wallet.address)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-white/45 transition-colors hover:border-white/25 hover:text-white"
                        title="Copy wallet address"
                      >
                        {copied === wallet.address ? (
                          <Check className="h-3.5 w-3.5 text-[#6dce9a]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied === wallet.address ? 'Copied' : 'Copy'}
                      </button>
                      <a
                        href={`https://etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/45 hover:border-white/25 hover:text-white"
                        title="Open in explorer"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(wallet)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/35 hover:border-[#ff6257]/50 hover:text-[#ff6257]"
                        title="Remove wallet"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {notice && (
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="fixed right-5 bottom-5 z-30 flex items-center gap-3 rounded-xl border border-[#6dce9a]/30 bg-[#111a17] px-4 py-3 text-xs text-[#b8f0d1] shadow-2xl"
          >
            <Check className="h-4 w-4" />
            {notice}
            <X className="ml-2 h-3.5 w-3.5 opacity-50" />
          </button>
        )}
        {modalOpen && (
          <div
            className="fixed inset-0 z-40 grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-title"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-[#6dce9a] uppercase">Demo mode</p>
                  <h2 id="connect-title" className="mt-2 text-xl font-medium">
                    Connect a wallet
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    This preview uses a simulated connection. No wallet or transaction is requested.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-white/40 hover:text-white"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleMockConnect}
                className="mt-7 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm transition-colors hover:border-[#2457ff]/60 hover:bg-[#2457ff]/10"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#2457ff]/20 text-[#8b9eff]">
                    <WalletCards className="h-4 w-4" />
                  </span>
                  Tutela demo wallet
                </span>
                <Plus className="h-4 w-4 text-white/40" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
