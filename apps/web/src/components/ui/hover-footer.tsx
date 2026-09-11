'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Bell, GitBranch, Mail } from 'lucide-react';

const linkGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', href: '#product' },
      { label: 'How it works', href: '#workflow' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Risk feed', href: '/risk-feed' },
      { label: 'Approvals', href: '/approvals' },
      { label: 'Wallets', href: '/wallets' },
    ],
  },
];

export function HoverFooter() {
  return (
    <footer className="relative isolate mt-8 overflow-hidden border-t border-white/[0.08] bg-[#0c0e12] px-5 pt-14 pb-7 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(36,87,255,0.18),transparent_68%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 pb-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr] lg:gap-10">
          <div>
            <Link href="/" className="group inline-flex">
              <Image
                src="/Tutela_3.png"
                alt="Tutela"
                width={832}
                height={256}
                className="h-[70px] w-[229px] object-contain object-left transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/45">
              Persistent monitoring for the wallets, approvals, and decisions that matter.
            </p>
            <Link
              href="/register"
              className="group mt-7 inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-[#6dce9a]"
            >
              Protect a wallet
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-medium tracking-[0.18em] text-white/35 uppercase">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
                    >
                      <span className="relative after:absolute after:right-0 after:-bottom-1 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#6dce9a] after:transition-transform after:duration-300 group-hover:after:scale-x-100">
                        {link.label}
                      </span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-medium tracking-[0.18em] text-white/35 uppercase">
              Stay protected
            </h3>
            <p className="mt-5 text-sm leading-6 text-white/45">
              Get security signals and product updates without the noise.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:hello@tutela.security"
                aria-label="Email Tutela"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-all hover:border-[#2457ff] hover:bg-[#2457ff]/15 hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                aria-label="Tutela on GitHub"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-all hover:border-[#2457ff] hover:bg-[#2457ff]/15 hover:text-white"
              >
                <GitBranch className="h-4 w-4" />
              </a>
              <a
                href="/alerts"
                aria-label="Open alerts"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/50 transition-all hover:border-[#2457ff] hover:bg-[#2457ff]/15 hover:text-white"
              >
                <Bell className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="relative hidden h-48 overflow-hidden border-t border-white/[0.07] lg:block">
          <motion.div
            initial={{ opacity: 0.25, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute inset-x-0 -bottom-7 text-center font-instrument-serif text-[clamp(7rem,20vw,17rem)] leading-none tracking-[-0.08em] text-white/[0.045] transition-colors duration-500 hover:text-[#2457ff]/[0.13]"
          >
            Tutela
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Tutela Security</span>
          <div className="flex flex-wrap gap-5">
            <Link href="/login" className="transition-colors hover:text-white">
              Log in
            </Link>
            <Link href="/register" className="transition-colors hover:text-white">
              Create account
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" /> Systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
