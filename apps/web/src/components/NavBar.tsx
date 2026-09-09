'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(getToken()));
  }, []);

  function handleLogout() {
    clearToken();
    setAuthed(false);
    router.push('/login');
  }

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          Tutela
        </Link>
        {authed && (
          <div className="flex items-center gap-6 text-sm">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:underline">
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="hover:underline">
              Log out
            </button>
          </div>
        )}
        {!authed && (
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
