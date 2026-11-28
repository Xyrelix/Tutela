'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authenticateWallet } from '@/lib/api-client';
import { isMobileBrowser } from '@/lib/wagmi';

// One page for sign in and sign up: the API signs in a known wallet or creates the account.
// WalletConnect is left out until it works reliably; mobile users use their wallet's browser.
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // navigator is unavailable during SSR, so read it after mount to avoid a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(isMobileBrowser());
  }, []);

  async function connect() {
    setError(null);
    setPending(true);
    try {
      await authenticateWallet('continue', 'injected');
      router.push('/dashboard');
    } catch (err) {
      console.error('[Tutela] Wallet sign-in failed:', err);
      setError(
        typeof window !== 'undefined' && !window.ethereum
          ? 'No browser wallet found. Install Rabby or MetaMask, or open this page in your wallet app.'
          : 'Could not verify this wallet. Approve the signature request in your wallet and try again.'
      );
    } finally {
      setPending(false);
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
          className="mx-auto h-28 w-auto object-contain sm:h-32"
        />
        <p className="mt-3 text-center text-sm text-white/45">Approval protection for your wallets.</p>

        {isMobile && (
          <p className="mt-6 flex items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-xs leading-5 text-white/55">
            On mobile, open this page in your wallet app&apos;s browser (e.g. Rabby or MetaMask → Browser).
          </p>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-[#ff6257]/30 bg-[#ff6257]/[0.08] px-3 py-3 text-xs leading-5 text-[#ffaaa3]">
            {error}
          </p>
        )}

        <motion.button
          type="button"
          onClick={connect}
          disabled={pending}
          whileTap={pending ? undefined : { scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-medium text-[#06070a] transition-colors hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? 'Waiting for signature…' : 'Continue with wallet'}
        </motion.button>

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
    </main>
  );
}
