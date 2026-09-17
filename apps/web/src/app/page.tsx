'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CaretDown,
  Circle,
  Clock,
  CurrencyBtc,
  CurrencyCircleDollar,
  CurrencyEth,
  Diamond,
  Gear,
  Hexagon,
  Key,
  List,
  Play,
  Polygon,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  TelegramLogo,
  Triangle,
  Wallet,
  X,
  Lightning,
} from '@phosphor-icons/react';
import ShaderDemoATC from '@/components/ui/atc-shader';
import { HoverFooter } from '@/components/ui/hover-footer';
import PricingSection from '@/components/ui/pricing-section';

const navItems = [
  { label: 'Product', href: '#product' },
  { label: 'How it works', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
];

const chainLogos = [
  { label: 'ethereum', Icon: CurrencyEth },
  { label: 'base', Icon: Circle },
  { label: 'polygon', Icon: Polygon },
  { label: 'arbitrum', Icon: Triangle },
  { label: 'optimism', Icon: Circle },
];

const features = [
  {
    icon: Clock,
    eyebrow: '01 / Watch',
    title: 'Always-on wallet intelligence',
    text: 'Tutela monitors every connected wallet and turns noisy on-chain activity into a short, useful signal.',
  },
  {
    icon: ShieldCheck,
    eyebrow: '02 / Decide',
    title: 'Explain the risk before you sign',
    text: 'See the contract, the behavior, and the reason behind each score before an approval becomes a problem.',
  },
  {
    icon: Lightning,
    eyebrow: '03 / Respond',
    title: 'Move from alert to action',
    text: 'Prepare revocations and route urgent alerts to the people who can protect the wallet fastest.',
  },
];

function BrandMark() {
  return (
    <Image
      src="/Tutela_nav.png"
      alt="Tutela"
      width={610}
      height={163}
      className="h-[31px] w-auto object-contain object-left"
    />
  );
}

function BrowserPreview() {
  return (
    <div className="relative mx-auto mt-12 max-w-6xl px-0 sm:mt-16 lg:mt-0 lg:max-w-none">
      <div className="absolute -inset-8 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(36,87,255,0.22),transparent_62%)] blur-2xl" />
      <div className="overflow-hidden rounded-[18px] border border-white/[0.14] bg-[#101217] shadow-[0_30px_100px_rgba(0,0,0,0.48)]">
        <div className="flex h-11 items-center justify-between border-b border-white/[0.08] bg-[#15171d] px-4">
          <div className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-[#ff6257]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#f9bd4f]" />
            <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-white/[0.08] bg-black/20 px-4 py-1 text-[10px] text-white/30 sm:flex">
            app.tutela.security / wallets
          </div>
          <div className="h-2 w-12 rounded-full bg-white/10" />
        </div>
        <div className="grid min-h-[380px] grid-cols-1 md:grid-cols-[190px_1fr]">
          <aside className="hidden border-r border-white/[0.08] p-5 md:block">
            <div className="mb-8">
              <Image
                src="/Tutela_3.png"
                alt="Tutela"
                width={832}
                height={256}
                className="h-[45px] w-[146px] object-contain object-left"
              />
            </div>
            <div className="space-y-2 text-[11px] text-white/40">
              <div className="flex items-center gap-2 rounded-md bg-[#2457ff]/15 px-3 py-2 text-white">
                <Wallet className="h-3.5 w-3.5" /> Wallets
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <ShieldWarning className="h-3.5 w-3.5" /> Risk feed
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Key className="h-3.5 w-3.5" /> Approvals
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Bell className="h-3.5 w-3.5" /> Alerts
              </div>
            </div>
            <div className="mt-24 rounded-lg border border-white/[0.08] p-3">
              <div className="mb-2 h-1.5 w-12 rounded-full bg-white/15" />
              <div className="h-1.5 w-20 rounded-full bg-white/10" />
              <div className="mt-3 h-7 rounded bg-[#2457ff]/20" />
            </div>
          </aside>
          <div className="p-5 sm:p-7">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="text-[11px] text-white/35">Tuesday, September 10, 2026</p>
                <h3 className="mt-1 text-lg font-medium tracking-[-0.03em] text-white">
                  Good morning, <span className="font-mono text-white/60">0x71C…9e3F</span>
                </h3>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Gear className="h-3.5 w-3.5 text-white/70" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>Wallets protected</span>
                  <Wallet className="h-3.5 w-3.5" />
                </div>
                <p className="mt-3 text-2xl font-medium text-white">12</p>
                <p className="mt-1 text-[10px] text-[#6dce9a]">+2 this month</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between text-[10px] text-white/40">
                  <span>Threats blocked</span>
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <p className="mt-3 text-2xl font-medium text-white">48</p>
                <p className="mt-1 text-[10px] text-[#6dce9a]">98.4% detection rate</p>
              </div>
              <div className="rounded-xl border border-[#ffb15c]/25 bg-[#ffb15c]/[0.06] p-4">
                <div className="flex items-center justify-between text-[10px] text-[#ffcb8b]">
                  <span>Needs attention</span>
                  <span className="h-2 w-2 rounded-full bg-[#ffb15c]" />
                </div>
                <p className="mt-3 text-2xl font-medium text-white">02</p>
                <p className="mt-1 text-[10px] text-[#ffcb8b]">Review activity</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] text-white/40">Network activity</p>
                    <p className="mt-1 text-sm text-white">Transaction safety score</p>
                  </div>
                  <span className="rounded-md bg-[#6dce9a]/10 px-2 py-1 text-[10px] text-[#6dce9a]">
                    Last 30 days
                  </span>
                </div>
                <div className="mt-5 flex h-24 items-end gap-1.5">
                  {[32, 48, 40, 68, 55, 82, 74, 92, 84, 96].map((height, index) => (
                    <div
                      key={height}
                      className={`flex-1 rounded-t ${index > 6 ? 'bg-[#6dce9a]' : 'bg-[#2457ff]'}`}
                      style={{ height: `${height}%`, opacity: 0.45 + index / 20 }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-[10px] text-white/40">Recent alerts</p>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#ffb15c]" />
                    <div>
                      <p className="text-[11px] text-white">Suspicious approval</p>
                      <p className="mt-1 text-[10px] text-white/35">USDC / unknown contract</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[#6dce9a]" />
                    <div>
                      <p className="text-[11px] text-white">Wallet secured</p>
                      <p className="mt-1 text-[10px] text-white/35">Revocation prepared</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-3 h-px w-2/3 bg-gradient-to-r from-transparent via-[#2457ff]/60 to-transparent" />
    </div>
  );
}

function CryptoObject() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[300px] sm:h-[520px] sm:max-w-[360px]">
      <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2457ff]/25 blur-3xl" />

      <div className="absolute top-1/2 left-1/2 h-[92%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border-[10px] border-[#15171c] bg-black shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:w-[68%]">
        <div className="absolute top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-[#15171c]" />
        <div className="relative h-full w-full overflow-hidden rounded-[34px] bg-black">
          <Image
            src="/Tutela%201.png"
            alt="Tutela app opening"
            fill
            sizes="(max-width: 640px) 320px, 380px"
            className="object-contain"
            priority
          />
        </div>
        <div className="absolute top-24 -left-[10px] h-8 w-[3px] rounded-full bg-[#0d0e11]" />
        <div className="absolute top-36 -left-[10px] h-12 w-[3px] rounded-full bg-[#0d0e11]" />
        <div className="absolute top-28 -right-[10px] h-16 w-[3px] rounded-full bg-[#0d0e11]" />
      </div>

      {[
        { Icon: CurrencyBtc, position: 'top-2 left-[0%]', color: '#ffcb8b', duration: 3.6, delay: 0 },
        { Icon: CurrencyEth, position: 'top-14 right-[2%]', color: '#8b9eff', duration: 5.2, delay: 0.4 },
        {
          Icon: Hexagon,
          position: 'top-1/2 left-[-6%] -translate-y-1/2',
          color: '#f9bd4f',
          duration: 4.1,
          delay: 1.1,
        },
        {
          Icon: Diamond,
          position: 'right-[-6%] bottom-[42%]',
          color: '#b28dff',
          duration: 6.4,
          delay: 0.2,
        },
        { Icon: Circle, position: 'bottom-14 left-[2%]', color: '#6dce9a', duration: 4.8, delay: 0.9 },
        {
          Icon: CurrencyCircleDollar,
          position: 'bottom-2 right-[0%]',
          color: '#ffb15c',
          duration: 5.7,
          delay: 1.6,
        },
      ].map(({ Icon, position, color, duration, delay }) => (
        <div
          key={position}
          className={`absolute ${position} grid h-12 w-12 animate-bounce place-items-center rounded-full border border-white/20 bg-white/[0.08] shadow-[0_0_28px_rgba(36,87,255,0.25)] backdrop-blur-md sm:h-14 sm:w-14`}
          style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
        </div>
      ))}

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#101217]/70 px-3 py-1.5 text-[10px] text-white/45 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" /> Monitoring active
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#090a0d] text-white selection:bg-[#2457ff] selection:text-white">
      <header
        className={`fixed inset-x-0 top-0 z-20 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled
            ? 'border-white/[0.08] bg-[#090a0d]/90 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" aria-label="Tutela home">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] text-white/55 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <Link
              href="/login"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#090a0d] transition-transform hover:scale-[1.03]"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 md:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div className="fixed top-[76px] right-5 z-20 w-fit rounded-xl border border-white/10 bg-[#13151a] p-4 md:hidden">
          <div className="grid gap-1 text-sm text-white/70">
            <Link href="/login" className="rounded-lg px-3 py-2 text-center hover:bg-white/5">
              Log in
            </Link>
            <Link
              href="/register"
              className="mt-2 rounded-lg bg-white px-3 py-2 text-center font-medium text-black"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
      <main>
        <section className="relative px-5 pt-20 pb-10 text-center sm:px-8 sm:pt-28 lg:pt-36 lg:text-left">
          <div className="pointer-events-none absolute inset-0 z-0 h-[620px] [mask-image:linear-gradient(to_bottom,black_0%,transparent_90%)] opacity-35">
            <ShaderDemoATC />
          </div>
          <div className="pointer-events-none absolute top-0 left-1/2 z-[1] h-[560px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(36,87,255,0.12),transparent_66%)]" />
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs text-white/60">
                <Sparkle className="h-3.5 w-3.5 text-[#6dce9a]" /> Persistent wallet security,
                finally automated{' '}
                <CaretDown className="h-3.5 w-3.5 rotate-[-90deg] text-white/35" />
              </div>
              <h1 className="font-sans text-[clamp(3rem,6vw,6rem)] leading-[0.92] tracking-[-0.055em] text-white">
                <span className="block lg:whitespace-nowrap">The security layer</span>
                <span className="block text-white/45 lg:whitespace-nowrap">
                  your wallet deserves.
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-[15px] leading-7 text-white/50 sm:text-base lg:mx-0">
                Tutela watches your wallets around the clock, explains what looks risky, and helps
                you act before a bad approval becomes a bad day.
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2457ff] px-6 py-3 text-sm font-medium shadow-[0_0_30px_rgba(36,87,255,0.22)] transition-transform hover:scale-[1.03] sm:w-auto"
                >
                  Protect a wallet <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#product"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-white/65 transition-colors hover:border-white/25 hover:text-white sm:w-auto"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> See how it works
                </a>
              </div>
            </div>
            <CryptoObject />
          </div>
          <div className="mt-14 sm:mt-20 lg:mt-24">
            <BrowserPreview />
          </div>
        </section>
        <section className="overflow-hidden border-y border-white/[0.07] bg-[#0c0e12] py-7">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 sm:flex-row sm:gap-10 sm:px-8">
            <span className="shrink-0 text-[10px] tracking-[0.22em] text-white/25 uppercase">
              Built for the wallets that matter
            </span>
            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max animate-marquee items-center gap-12 hover:[animation-play-state:paused]">
                {[...chainLogos, ...chainLogos].map(({ label, Icon }, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-white/35"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="product" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="mb-5 text-[11px] tracking-[0.22em] text-[#6dce9a] uppercase">
              A quieter kind of confidence
            </p>
            <h2 className="font-sans text-5xl leading-none tracking-[-0.04em] text-white sm:text-6xl">
              Less noise.
              <br />
              <span className="text-white/40">More control.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-6 text-white/45">
              Security should feel like a calm background process, not another tab you have to
              babysit.
            </p>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.eyebrow}
                className="bg-[#0c0e12] p-7 transition-colors hover:bg-[#11151d] sm:p-9"
              >
                <feature.icon className="h-5 w-5 text-[#2457ff]" />
                <p className="mt-12 text-[10px] tracking-[0.18em] text-white/30 uppercase">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-4 text-xl font-medium tracking-[-0.03em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/45">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section
          id="workflow"
          className="border-y border-white/[0.07] bg-[#0c0e12] px-5 py-24 sm:px-8 lg:px-10"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-5 text-[11px] tracking-[0.22em] text-[#ffb15c] uppercase">
                A response loop that closes
              </p>
              <h2 className="font-sans text-5xl leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl">
                From first signal
                <br />
                <span className="text-white/40">to final sign-off.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/45">
                Connect a wallet once. Tutela keeps watch, gives your team context, and makes the
                next right action obvious.
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 text-sm text-white hover:text-[#6dce9a]"
              >
                Start protecting <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative rounded-2xl border border-white/[0.09] bg-[#101217] p-5 sm:p-8">
              <div className="absolute top-12 left-10 h-[calc(100%-96px)] w-px bg-gradient-to-b from-[#2457ff] via-[#2457ff]/40 to-transparent" />
              <div className="space-y-8">
                {[
                  [
                    '09:41',
                    'Unusual approval detected',
                    'USDT allowance on unknown contract',
                    'Review risk context',
                  ],
                  [
                    '09:43',
                    'Risk engine found 3 signals',
                    'New deployer · empty history · high allowance',
                    'Score: 92 / critical',
                  ],
                  [
                    '09:45',
                    'Revocation prepared',
                    'One-click action ready for your approval',
                    'Protected before funds moved',
                  ],
                  [
                    '09:46',
                    'Alert sent to Telegram',
                    'Critical signal delivered straight to your linked chat',
                    'Delivered in real time',
                  ],
                ].map(([time, title, detail, status], index) => (
                  <div key={title} className="relative flex gap-6">
                    <div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-[#0c0e12] bg-[#2457ff] ring-4 ring-[#2457ff]/20" />
                    <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-white/35">
                          {time} / {index === 2 ? 'ACTION' : index === 3 ? 'ALERT' : 'MONITORING'}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[10px] ${
                            index === 1
                              ? 'text-[#ffb15c]'
                              : index === 3
                                ? 'text-[#8b9eff]'
                                : 'text-[#6dce9a]'
                          }`}
                        >
                          {index === 3 && <TelegramLogo className="h-3 w-3" />}
                          {status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-white">{title}</p>
                      <p className="mt-1 text-xs text-white/40">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section id="security" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-[11px] tracking-[0.22em] text-[#8b9eff] uppercase">
              Built on your terms
            </p>
            <h2 className="font-sans text-5xl leading-none tracking-[-0.04em] text-white sm:text-6xl">
              Security that starts
              <br />
              <span className="text-white/40">with your wallet.</span>
            </h2>
            <p className="mt-6 text-sm leading-6 text-white/45">
              Tutela never asks for a password, an email, or your seed phrase — just a signature.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              {
                title: 'No passwords or email',
                detail: 'Your wallet is the only account you need.',
              },
              {
                title: 'One-time challenge',
                detail: 'Each sign-in message is consumed after use.',
              },
              {
                title: 'Read-only access',
                detail: 'Tutela watches activity — it never controls your wallet.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-[#101217] p-6">
                <ShieldCheck className="h-5 w-5 text-[#6dce9a]" />
                <h3 className="mt-4 text-sm font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/45">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
        <PricingSection />
        <section className="px-5 pt-8 pb-24 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-2xl border border-white/[0.1] bg-[#111725] p-8 sm:p-12 lg:flex-row lg:items-center">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-[#6dce9a] uppercase">
                Your next approval is already on its way
              </p>
              <h2 className="mt-4 max-w-xl font-sans text-4xl leading-none tracking-[-0.04em] text-white sm:text-5xl">
                Make sure it is one you trust.
              </h2>
            </div>
            <Link
              href="/register"
              className="flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
            >
              Protect your wallet <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <HoverFooter />
    </div>
  );
}
