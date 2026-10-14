'use client';

import Link from 'next/link';
import { ArrowRight, Compass } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-[#090a0d] px-5 py-20 text-center text-white">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[#8b9eff]">
          <Compass className="h-6 w-6" />
        </span>
        <p className="mt-6 text-[11px] tracking-[0.22em] text-white/35 uppercase">Error 404</p>
        <h1 className="mt-4 font-sans text-4xl leading-none tracking-[-0.04em] text-white sm:text-5xl">
          This page wandered off.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-white/45">
          The page you&apos;re looking for doesn&apos;t exist, or it moved somewhere Tutela
          isn&apos;t watching.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2457ff] px-5 py-3 text-sm font-medium text-white shadow-[0_0_30px_rgba(36,87,255,0.22)]"
        >
          Back to safety <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
