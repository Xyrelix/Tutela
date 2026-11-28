'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DeviceMobile, QrCode, Wallet } from '@phosphor-icons/react';
import { authenticateWallet } from '@/lib/api-client';
import { isMobileBrowser } from '@/lib/wagmi';
import { WalletConnectPrompt } from '@/components/WalletConnectPrompt';

type ConnectorId = 'injected' | 'walletConnect';
const LAST_USED_KEY = 'tutela:last-connector';

const OPTIONS: { id: ConnectorId; label: string; Icon: typeof Wallet }[] = [
  { id: 'injected', label: 'Continue with browser wallet', Icon: Wallet },
  { id: 'walletConnect', label: 'Continue with WalletConnect', Icon: QrCode },
];

// One page for sign in and sign up: the API signs in a known wallet or creates the account.
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ConnectorId | null>(null);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastUsed, setLastUsed] = useState<ConnectorId | null>(null);

  useEffect(() => {
    // navigator and localStorage are unavailable during SSR, so read them after mount
    // to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(isMobileBrowser());
    try {
      const saved = localStorage.getItem(LAST_USED_KEY);
      if (saved === 'injected' || saved === 'walletConnect') setLastUsed(saved);
    } catch {
      // storage blocked (private mode); the badge is only a convenience
    }
  }, []);

  async function connect(connectorId: ConnectorId) {
    setError(null);
    setPending(connectorId);
    try {
      await authenticateWallet('continue', connectorId, setWcUri);
      try {
        localStorage.setItem(LAST_USED_KEY, connectorId);
      } catch {
        // ignore
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('[Tutela] Wallet sign-in failed:', err);
      setError('Could not verify this wallet. Approve the signature request in your wallet and try again.');
    } finally {
      setPending(null);
      setWcUri(null);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-76px)] flex-col items-center justify-center overflow-hidden bg-[#06070a] px-5 py-16 text-white">
      {/* Eclipse: a dark planet whose rim catches the light. */}
      <div aria-hidden className="pointer-events-none absolute top-[-62vmax] left-1/2 h-[100vmax] w-[100vmax] -translate-x-1/2">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,transparent_96%,rgba(52,213,232,0.35)_99%,transparent_100%)] blur-md" />
        <div className="absolute inset-0 rounded-full bg-[#06070a] shadow-[0_18px_80px_-10px_rgba(36,87,255,0.55),0_2px_24px_rgba(140,230,255,0.45)]" />
      </div>

      <div className="relative w-full max-w-sm">
        <Image
          src="/Tutela_3.png"
          alt="Tutela"
          width={832}
          height={256}
          priority
          className="mx-auto h-14 w-auto object-contain"
        />
        <p className="mt-3 text-center text-sm text-white/45">Approval protection for your wallets.</p>

        {isMobile && (
          <p className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-xs leading-5 text-white/55">
            <DeviceMobile className="mt-0.5 h-4 w-4 shrink-0 text-[#8b9eff]" />
            On mobile, open this page in your wallet app&apos;s browser for the most reliable connection.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-[#ff6257]/30 bg-[#ff6257]/[0.08] px-3 py-3 text-xs leading-5 text-[#ffaaa3]">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {OPTIONS.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              type="button"
              onClick={() => connect(id)}
              disabled={pending !== null}
              whileTap={pending ? undefined : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-[#06070a] transition-colors hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
            >
              <Icon className="h-4 w-4" weight="bold" />
              {pending === id ? 'Waiting for signature…' : label}
              {lastUsed === id && pending !== id && (
                <span className="absolute -top-2 right-4 rounded-full border border-white/10 bg-[#1b1e26] px-2 py-0.5 text-[10px] font-normal text-white/70">
                  Last used
                </span>
              )}
            </motion.button>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-white/35">
          You&apos;ll sign a message. No transaction, no gas.
        </p>
        <p className="mt-10 text-center text-[11px] text-white/30">
          By continuing you agree to the{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-white/60">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-white/60">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      {wcUri && <WalletConnectPrompt uri={wcUri} onClose={() => setWcUri(null)} />}
    </main>
  );
}
