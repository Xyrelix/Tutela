'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowClockwise, Warning } from '@phosphor-icons/react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#090a0d] px-5 py-20 text-center text-white">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#ff6257]/25 bg-[#ff6257]/10 text-[#ff6257]">
          <Warning className="h-6 w-6" />
        </span>
        <p className="mt-6 text-[11px] tracking-[0.22em] text-white/35 uppercase">
          Something went wrong
        </p>
        <h1 className="mt-4 font-sans text-4xl leading-none tracking-[-0.04em] text-white sm:text-5xl">
          Tutela hit a snag.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/45">
          This page failed to load. Your wallets are still being monitored — try again, or head
          back home.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-[#2457ff] px-5 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(36,87,255,0.22)]"
          >
            <ArrowClockwise className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/65 transition-colors hover:border-white/25 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
