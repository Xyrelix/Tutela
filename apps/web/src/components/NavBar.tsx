'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell,
  Gear,
  Key,
  ShieldWarning,
  SquaresFour,
  Wallet as WalletIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { clearToken, getToken } from '@/lib/api-client';

const LINKS: Array<{ href: string; label: string; Icon: Icon }> = [
  { href: '/dashboard', label: 'Dashboard', Icon: SquaresFour },
  { href: '/wallets', label: 'Wallets', Icon: WalletIcon },
  { href: '/risk-feed', label: 'Risk Feed', Icon: ShieldWarning },
  { href: '/approvals', label: 'Approvals', Icon: Key },
  { href: '/alerts', label: 'Alerts', Icon: Bell },
];

function useAuthed() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthed(Boolean(getToken())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return authed;
}

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const authed = useAuthed();

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  if (pathname === '/') {
    return null;
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <header className="border-b border-white/[0.08] bg-[#090a0d]">
        <nav className="mx-auto flex max-w-5xl items-center justify-center px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Tutela home">
            <Image
              src="/Tutela_nav.png"
              alt="Tutela"
              width={610}
              height={163}
              className="h-[31px] w-auto object-contain"
            />
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="border-b border-white/[0.08] bg-[#090a0d]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Tutela home">
          <Image
            src="/Tutela_nav.png"
            alt="Tutela"
            width={610}
            height={163}
            className="h-[31px] w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-5 text-[13px]">
          {authed ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                aria-label="Settings"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
              >
                <Gear className="h-4 w-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white px-4 py-2 font-medium text-[#090a0d] transition-transform hover:scale-[1.03]"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-white/60 transition-colors hover:text-white">
                Log in
              </Link>
              <Link
                href="/register"
                className="hidden rounded-full bg-white px-4 py-2 font-medium text-[#090a0d] transition-transform hover:scale-[1.03] sm:block"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const authed = useAuthed();

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (pathname === '/' || isAuthPage || !authed) {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/[0.08] bg-[#0c0e12] px-4 py-6 md:block">
      <nav className="space-y-1 text-[13px]">
        {LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-[#2457ff]/15 text-white'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              <link.Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
