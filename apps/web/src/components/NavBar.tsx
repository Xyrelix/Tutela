'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Gear,
  Key,
  List,
  ShieldWarning,
  SignOut,
  SquaresFour,
  Wallet as WalletIcon,
  X,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { AUTH_CHANGE_EVENT, hasSession, logout } from '@/lib/api-client';

const MotionLink = motion.create(Link);

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
    const check = () => {
      void hasSession().then(setAuthed);
    };
    const timer = window.setTimeout(check, 0);
    window.addEventListener(AUTH_CHANGE_EVENT, check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(AUTH_CHANGE_EVENT, check);
    };
  }, []);

  return authed;
}

const SIDEBAR_TOGGLE_EVENT = 'tutela-sidebar-toggle';
let sidebarOpenState = false;

function setSidebarOpen(open: boolean) {
  sidebarOpenState = open;
  window.dispatchEvent(new CustomEvent<boolean>(SIDEBAR_TOGGLE_EVENT, { detail: open }));
}

function useSidebarOpen() {
  const [open, setOpen] = useState(sidebarOpenState);

  useEffect(() => {
    const handler = (event: Event) => setOpen((event as CustomEvent<boolean>).detail);
    window.addEventListener(SIDEBAR_TOGGLE_EVENT, handler);
    return () => window.removeEventListener(SIDEBAR_TOGGLE_EVENT, handler);
  }, []);

  return open;
}

export function NavBar() {
  const pathname = usePathname();
  const authed = useAuthed();
  const sidebarOpen = useSidebarOpen();

  if (pathname === '/') {
    return null;
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#090a0d]">
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
    <>
      <div className="h-[76px]" aria-hidden="true" />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.08] bg-[#090a0d]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            {authed && (
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white md:hidden"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </button>
            )}
            <Link
              href="/"
              aria-label="Tutela home"
              className="md:absolute md:top-1/2 md:left-[112px] md:-translate-x-1/2 md:-translate-y-1/2"
            >
              <Image
                src="/Tutela_nav.png"
                alt="Tutela"
                width={610}
                height={163}
                className="h-[31px] w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex items-center gap-5 text-[13px] md:ml-auto">
            {authed ? (
              <Link
                href="/settings"
                aria-label="Settings"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/25 hover:text-white"
              >
                <Gear className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-white/60 transition-colors hover:text-white">
                  Log in
                </Link>
                <MotionLink
                  href="/register"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className="hidden rounded-full bg-white px-4 py-2 font-medium text-[#090a0d] sm:block"
                >
                  Get started
                </MotionLink>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const authed = useAuthed();
  const sidebarOpen = useSidebarOpen();

  function handleLogout() {
    setSidebarOpen(false);
    void logout().finally(() => router.push('/login'));
  }

  const isPublicOnlyPage =
    pathname === '/login' || pathname === '/register' || pathname === '/terms' || pathname === '/privacy';
  if (pathname === '/' || isPublicOnlyPage || !authed) {
    return null;
  }

  return (
    <>
      <div className="hidden w-56 shrink-0 md:block" aria-hidden="true" />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-[76px] left-0 z-[35] flex h-[calc(100vh-76px)] w-64 shrink-0 flex-col overflow-y-auto border-r border-white/[0.08] bg-[#0c0e12] px-4 py-6 transition-transform duration-200 md:z-20 md:w-56 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="space-y-1 text-[13px]">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive ? 'text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-[#2457ff]/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative flex items-center gap-2.5">
                  <link.Icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/55 transition-colors hover:bg-white/5 hover:text-white"
        >
          <SignOut className="h-4 w-4" />
          Log out
        </button>
      </aside>
    </>
  );
}
