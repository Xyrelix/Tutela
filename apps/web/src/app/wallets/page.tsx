'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Pulse,
  ArrowUpRight,
  Check,
  Copy,
  Plus,
  MagnifyingGlass,
  ShieldCheck,
  Sparkle,
  Trash,
  Wallet as WalletIcon,
  X,
} from '@phosphor-icons/react';
import { deleteWallet, getMe, getToken, listWallets, Me, registerWallet, Wallet } from '@/lib/api-client';

const FREE_WALLET_LIMIT = 3;
const SENTINEL_WALLET_LIMIT = 25;

function getWalletLimit(plan: string): number | null {
  if (plan === 'free') return FREE_WALLET_LIMIT;
  if (plan === 'sentinel') return SENTINEL_WALLET_LIMIT;
  return null;
}

const CHAIN_META: Record<string, { label: string; color: string; mark: string }> = {
  ethereum: { label: 'Ethereum', color: '#8b9eff', mark: 'Ξ' },
  base: { label: 'Base', color: '#6dce9a', mark: 'B' },
};

function shortAddress(address: string) {
  if (address.includes('...')) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chainFilter, setChainFilter] = useState('all');
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [newChain, setNewChain] = useState('ethereum');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    listWallets()
      .then(setWallets)
      .catch(() => setError('Could not load wallets.'))
      .finally(() => setLoading(false));
    getMe()
      .then(setMe)
      .catch(() => {});
  }, [router]);

  const walletLimit = me ? getWalletLimit(me.plan) : null;
  const atWalletLimit = walletLimit !== null && wallets.length >= walletLimit;

  const filteredWallets = wallets.filter((wallet) => {
    const matchesChain = chainFilter === 'all' || wallet.chain === chainFilter;
    const matchesQuery = `${wallet.address} ${wallet.chain}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesChain && matchesQuery;
  });

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const wallet = await registerWallet(newAddress, newChain);
      setWallets((current) => [wallet, ...current]);
      setNewAddress('');
      setModalOpen(false);
      setNotice('Wallet added to monitoring.');
    } catch (err) {
      const serverMessage =
        isAxiosError(err) && typeof err.response?.data?.error === 'string'
          ? err.response.data.error
          : null;
      setFormError(serverMessage ?? 'Could not add wallet. Check the address format.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(wallet: Wallet) {
    const isLoginWallet = me?.walletAddress?.toLowerCase() === wallet.address.toLowerCase();
    if (isLoginWallet) {
      const confirmed = window.confirm(
        'This is the wallet you sign in with. Removing it stops monitoring, but you can still log in with it. Continue?'
      );
      if (!confirmed) return;
    }

    await deleteWallet(wallet.id);
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
            {walletLimit !== null && (
              <p className="mt-3 text-xs text-white/35">
                {wallets.length} of {walletLimit} wallets used on the{' '}
                {me?.plan === 'free' ? 'Free' : 'Sentinel'} plan
                {atWalletLimit && ' — upgrade for more wallets'}.
              </p>
            )}
          </div>
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={atWalletLimit}
            whileHover={atWalletLimit ? undefined : { scale: 1.02 }}
            whileTap={atWalletLimit ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            title={
              atWalletLimit
                ? `${me?.plan === 'free' ? 'Free' : 'Sentinel'} plan wallet limit reached`
                : undefined
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2457ff] px-5 py-3 text-sm font-medium shadow-[0_0_30px_rgba(36,87,255,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <WalletIcon className="h-4 w-4" />
            Add a wallet
          </motion.button>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {[
            [
              'Wallets protected',
              wallets.length.toString().padStart(2, '0'),
              'All systems monitored',
              ShieldCheck,
            ],
            ['Networks active', chains.toString().padStart(2, '0'), 'Ethereum + Base', Pulse],
            ['Protection status', 'Good', 'No urgent action needed', Sparkle],
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
                <MagnifyingGlass className="h-3.5 w-3.5" />
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
            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-white/40">
                Loading wallets…
              </div>
            ) : error ? (
              <div className="px-6 py-16 text-center text-sm text-[#ff6257]">{error}</div>
            ) : filteredWallets.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-white/60">No wallets match this view.</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-4 text-xs text-[#6dce9a] hover:underline"
                >
                  Add a wallet
                </button>
              </div>
            ) : (
              filteredWallets.map((wallet, index) => {
                const meta = CHAIN_META[wallet.chain] ?? CHAIN_META.ethereum;
                const isLoginWallet = me?.walletAddress?.toLowerCase() === wallet.address.toLowerCase();
                return (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 8) * 0.04 }}
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
                          {isLoginWallet && (
                            <span
                              className="rounded-full bg-[#8b9eff]/10 px-2 py-0.5 text-[9px] tracking-[0.12em] text-[#8b9eff] uppercase"
                              title="You sign in with this wallet — removing it from monitoring won't affect your ability to log in."
                            >
                              Login wallet
                            </span>
                          )}
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
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        <AnimatePresence>
          {notice && (
            <motion.button
              key="notice"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              type="button"
              onClick={() => setNotice(null)}
              className="fixed right-5 bottom-5 z-30 flex items-center gap-3 rounded-xl border border-[#6dce9a]/30 bg-[#111a17] px-4 py-3 text-xs text-[#b8f0d1] shadow-2xl"
            >
              <Check className="h-4 w-4" />
              {notice}
              <X className="ml-2 h-3.5 w-3.5 opacity-50" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="connect-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-6 shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 id="connect-title" className="text-xl font-medium">
                      Add a wallet
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      Register an address to monitor. No signature required — Tutela only watches
                      it, it never controls it.
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
                <form onSubmit={handleAdd} className="mt-6 flex flex-col gap-4">
                  <input
                    required
                    placeholder="0x…"
                    value={newAddress}
                    onChange={(event) => setNewAddress(event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/25"
                  />
                  <select
                    value={newChain}
                    onChange={(event) => setNewChain(event.target.value)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="base">Base</option>
                  </select>
                  {formError && <p className="text-xs text-[#ff6257]">{formError}</p>}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={submitting ? undefined : { scale: 1.02 }}
                    whileTap={submitting ? undefined : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2457ff] px-4 py-3 text-sm font-medium disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? 'Adding…' : 'Add wallet'}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
