'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, getToken } from '@/lib/api-client';

const LINKS = [
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

  return (
    <header className="border-b border-white/[0.08] bg-[#090a0d]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Tutela home">
          <Image
            src="/Tutela_3.png"
            alt="Tutela"
            width={832}
            height={256}
            className="h-9 w-[117px] object-contain"
          />
        </Link>
        <div className="flex items-center gap-4 text-sm sm:gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-white/55 transition-colors hover:text-white sm:block"
            >
              {link.label}
            </Link>
          ))}
          {authed && (
            <button onClick={handleLogout} className="hover:underline">
              Log out
            </button>
          )}
          {!authed && (
            <>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
              <Link href="/register" className="hidden hover:underline sm:block">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
