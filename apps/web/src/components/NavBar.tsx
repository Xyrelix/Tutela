'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Gear } from '@phosphor-icons/react';
import { clearToken, getToken } from '@/lib/api-client';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/wallets', label: 'Wallets' },
  { href: '/risk-feed', label: 'Risk Feed' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/alerts', label: 'Alerts' },
];

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthed(Boolean(getToken())), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleLogout() {
    clearToken();
    setAuthed(false);
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
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Tutela home" className="justify-self-start">
          <Image
            src="/Tutela_nav.png"
            alt="Tutela"
            width={610}
            height={163}
            className="h-[31px] w-auto object-contain object-left"
          />
        </Link>
        <div className="hidden items-center gap-6 text-[13px] text-white/55 md:flex">
          {authed &&
            LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
        </div>
        <div className="flex items-center gap-5 justify-self-end text-[13px]">
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
