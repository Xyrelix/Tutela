'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ChatCircle,
  Copy,
  ShieldCheck,
  Wallet as WalletIcon,
} from '@phosphor-icons/react';
import { getMe, getToken, getTelegramLinkCode, Me, TelegramLinkCode } from '@/lib/api-client';

function secondsUntil(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000));
}

function shortWallet(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState<TelegramLinkCode | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletCopied, setWalletCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    getMe()
      .then(setMe)
      .catch(() => setError('Could not load your account.'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!linkCode) return;

    const tick = () => {
      const remaining = secondsUntil(linkCode.expiresAt);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setLinkCode(null);
      }
    };
    tick();

    const countdown = window.setInterval(tick, 1000);
    pollRef.current = window.setInterval(async () => {
      const fresh = await getMe().catch(() => null);
      if (fresh?.telegramLinked) {
        setMe(fresh);
        setLinkCode(null);
      }
    }, 3000);

    return () => {
      window.clearInterval(countdown);
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [linkCode]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await getTelegramLinkCode();
      setLinkCode(result);
    } catch {
      setError('Could not generate a linking code.');
    } finally {
      setGenerating(false);
    }
  }

  async function copyCode() {
    if (!linkCode) return;
    await navigator.clipboard.writeText(linkCode.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyWallet() {
    if (!me) return;
    await navigator.clipboard.writeText(me.walletAddress);
    setWalletCopied(true);
    window.setTimeout(() => setWalletCopied(false), 1600);
  }

  const deepLink = linkCode?.botUsername
    ? `https://t.me/${linkCode.botUsername}?start=${linkCode.code}`
    : null;
  const isFreePlan = me?.plan === 'free';

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="border-b border-white/[0.08] pb-8">
          <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#8b9eff] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8b9eff]" />
            Account
          </div>
          <h1 className="font-sans text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
            Your account,
            <br />
            <span className="text-white/40">your controls.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
            Manage the wallet you sign in with, your plan, and how Tutela reaches you when it
            matters.
          </p>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-white/40">Loading…</p>
        ) : error && !me ? (
          <p className="mt-8 text-sm text-[#ff6257]">{error}</p>
        ) : me ? (
          <div className="mt-8 flex flex-col gap-6">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
              {[
                ['Plan', me.plan, me.plan === 'free' ? 'Upgrade anytime' : 'Full access', ShieldCheck],
                ['Wallet', shortWallet(me.walletAddress), 'Signed in with', WalletIcon],
                [
                  'Telegram',
                  me.telegramLinked ? 'Linked' : 'Not linked',
                  me.telegramLinked ? 'Alerts are active' : 'Connect to get alerts',
                  ChatCircle,
                ],
              ].map(([label, value, detail, Icon]) => (
                <div key={label as string} className="bg-[#101217] p-6 sm:p-7">
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>{label as string}</span>
                    <Icon className="h-4 w-4 text-[#6dce9a]" />
                  </div>
                  <p className="mt-5 text-3xl font-medium tracking-[-0.05em] text-white capitalize">
                    {value as string}
                  </p>
                  <p className="mt-2 text-xs text-[#6dce9a]/80">{detail as string}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#101217] p-6 sm:p-7">
              <p className="text-[11px] tracking-[0.16em] text-white/30 uppercase">
                Wallet address
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-sm text-white/80">
                  {me.walletAddress}
                </span>
                <button
                  type="button"
                  onClick={copyWallet}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-white/60 hover:border-white/25 hover:text-white"
                >
                  {walletCopied ? (
                    <CheckCircle className="h-3.5 w-3.5 text-[#6dce9a]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {walletCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#101217] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-[#8b9eff]">
                    <ChatCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-medium">Telegram alerts</h2>
                    <p className="mt-1 text-xs text-white/40">
                      Get risky-approval and drainer alerts sent straight to Telegram.
                    </p>
                  </div>
                </div>
                {me.telegramLinked && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6dce9a]/10 px-3 py-1 text-[11px] text-[#6dce9a]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Connected
                  </span>
                )}
              </div>

              {!me.telegramLinked && isFreePlan && (
                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  <p className="text-xs text-white/45">
                    Telegram alerts are a Sentinel-plan feature.{' '}
                    <Link href="/#pricing" className="text-white hover:text-[#6dce9a]">
                      Upgrade to Sentinel
                    </Link>{' '}
                    to get risky-approval alerts sent straight to Telegram.
                  </p>
                </div>
              )}

              {!me.telegramLinked && !isFreePlan && (
                <div className="mt-6 border-t border-white/[0.07] pt-5">
                  {!linkCode ? (
                    <motion.button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating}
                      whileHover={generating ? undefined : { scale: 1.02 }}
                      whileTap={generating ? undefined : { scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2457ff] px-4 py-2.5 text-xs font-medium disabled:opacity-50"
                    >
                      {generating ? 'Generating…' : 'Generate linking code'}
                    </motion.button>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-lg tracking-[0.2em]">
                          {linkCode.code}
                        </span>
                        <button
                          type="button"
                          onClick={copyCode}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs text-white/60 hover:border-white/25 hover:text-white"
                        >
                          {copied ? (
                            <CheckCircle className="h-3.5 w-3.5 text-[#6dce9a]" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      {deepLink ? (
                        <a
                          href={deepLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#6dce9a] px-4 py-2.5 text-xs font-medium text-[#08110d]"
                        >
                          Open Telegram &amp; link
                        </a>
                      ) : (
                        <p className="text-xs text-white/45">
                          Message the Tutela Telegram bot with{' '}
                          <code className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[11px]">
                            /start {linkCode.code}
                          </code>
                        </p>
                      )}

                      <p className="text-xs text-white/30">
                        Expires in {secondsLeft}s — this page checks automatically once you&apos;ve
                        linked.
                      </p>
                    </div>
                  )}
                  {error && <p className="mt-3 text-xs text-[#ff6257]">{error}</p>}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
