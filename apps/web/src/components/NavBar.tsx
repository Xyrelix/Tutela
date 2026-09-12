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
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Tutela home" className="justify-self-start">
          <Image
            src="/Tutela_3.png"
            alt="Tutela"
            width={832}
            height={256}
            className="h-9 w-[117px] object-contain"
          />
        </Link>
        <div className="hidden items-center gap-6 text-[13px] text-white/55 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-5 justify-self-end text-[13px]">
          {authed ? (
            <button
              onClick={handleLogout}
              className="text-white/60 transition-colors hover:text-white"
            >
              Log out
            </button>
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
