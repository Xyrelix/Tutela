'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, WalletCards } from 'lucide-react';
import Image from 'next/image';
import { authenticateWallet, setToken } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = await authenticateWallet('register');
      setToken(token);
      router.push('/wallets');
    } catch {
      setError(
        'Could not verify this wallet. Connect an available wallet and approve the signature request.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#090a0d] px-5 py-12 text-white sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(36,87,255,0.16),transparent_68%)]" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <div className="mb-7 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" />
            Start protecting
          </div>
          <h1 className="font-instrument-serif text-6xl leading-[0.94] tracking-[-0.05em]">
            Turn a wallet
            <br />
            <span className="text-white/40">into a signal.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-white/45">
            Set up a private Tutela account with the wallet you want to keep under watch.
          </p>
          <div className="mt-9 space-y-3 text-xs text-white/50">
            {[
              'No passwords or email addresses',
              'Continuous approval monitoring',
              'Your keys never leave your wallet',
            ].map((item) => (
              <p key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#6dce9a]" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#101217]/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8">
          <Image
            src="/Tutela_3.png"
            alt="Tutela"
            width={832}
            height={256}
            className="h-9 w-[117px] object-contain object-left lg:hidden"
          />
          <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2457ff]/30 bg-[#2457ff]/10 text-[#8b9eff] lg:mt-0">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <p className="mt-7 text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
            Wallet onboarding
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">Protect a wallet</h2>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Connect the wallet you want to monitor and sign one verification message to create your
            account.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-[#ff6257]/30 bg-[#ff6257]/[0.08] px-3 py-3 text-xs leading-5 text-[#ffaaa3]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2457ff] text-sm font-medium shadow-[0_0_30px_rgba(36,87,255,0.2)] transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
            >
              <WalletCards className="h-4 w-4" />
              {submitting ? 'Waiting for signature…' : 'Connect and create account'}
            </button>
          </form>
          <div className="mt-7 flex items-center justify-between border-t border-white/[0.08] pt-5 text-xs text-white/40">
            <span>Already protecting a wallet?</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-[#6dce9a]"
            >
              Sign in <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-white/25">
            <ShieldCheck className="h-3.5 w-3.5" /> Non-custodial by design
          </p>
        </div>
      </div>
    </main>
  );
}
