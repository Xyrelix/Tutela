'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  ShieldCheck,
  ShieldWarning,
  Wallet as WalletIcon,
  Warning,
} from '@phosphor-icons/react';
import {
  Alert,
  Approval,
  getMe,
  getToken,
  listAlerts,
  listApprovals,
  listScans,
  listWallets,
  Me,
  Scan,
  Wallet,
} from '@/lib/api-client';

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function alertMeta(type: string) {
  if (type.includes('critical')) return { label: 'Critical', color: '#ff6257', Icon: ShieldWarning };
  if (type.includes('risk')) return { label: 'Review', color: '#ffb15c', Icon: Warning };
  if (type.includes('secured')) return { label: 'Protected', color: '#6dce9a', Icon: ShieldCheck };
  return { label: 'Activity', color: '#8b9eff', Icon: Bell };
}

function alertTitle(type: string) {
  return type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dailySafety(scans: Scan[]) {
  const days = Array.from({ length: 10 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (9 - index));
    return day;
  });

  return days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const dayScans = scans.filter((scan) => {
      const created = new Date(scan.createdAt);
      return created >= day && created < next;
    });
    if (dayScans.length === 0) return { height: 6, safety: null as number | null };
    const avgRisk = dayScans.reduce((sum, scan) => sum + scan.riskScore, 0) / dayScans.length;
    const safety = Math.max(4, Math.round(100 - avgRisk));
    return { height: safety, safety };
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    Promise.all([
      getMe(),
      listWallets(),
      listScans(),
      listApprovals(),
      listAlerts(),
    ])
      .then(([meData, walletsData, scansData, approvalsData, alertsData]) => {
        setMe(meData);
        setWallets(walletsData);
        setScans(scansData);
        setApprovals(approvalsData);
        setAlerts(alertsData);
      })
      .catch(() => setError('Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, [router]);

  const activeApprovals = approvals.filter((approval) => approval.status === 'active').length;
  const resolvedApprovals = approvals.length - activeApprovals;
  const resolvedRate = approvals.length
    ? Math.round((resolvedApprovals / approvals.length) * 100)
    : 0;

  const safetyBuckets = useMemo(() => dailySafety(scans), [scans]);

  const recentAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [alerts]
  );

  const summaryCards = [
    {
      label: 'Wallets protected',
      value: wallets.length.toString().padStart(2, '0'),
      detail: 'All systems monitored',
      Icon: WalletIcon,
      color: '#6dce9a',
    },
    {
      label: 'Threats resolved',
      value: resolvedApprovals.toString().padStart(2, '0'),
      detail: `${resolvedRate}% resolved`,
      Icon: ShieldCheck,
      color: '#6dce9a',
    },
    {
      label: 'Needs attention',
      value: activeApprovals.toString().padStart(2, '0'),
      detail: 'Review activity',
      Icon: ShieldWarning,
      color: '#ffb15c',
    },
  ];

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-white/[0.08] pb-8">
          <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" />
            Overview
          </div>
          <h1 className="font-sans text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
            {greeting()},
            <br />
            <span className="font-mono text-[1.2rem] text-white/40 sm:text-[1.5rem]">
              {me ? shortAddress(me.walletAddress) : '…'}
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            — here&apos;s what&apos;s happening across your protected wallets.
          </p>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-white/40">Loading…</p>
        ) : error ? (
          <p className="mt-8 text-sm text-[#ff6257]">{error}</p>
        ) : (
          <>
            <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
              {summaryCards.map(({ label, value, detail, Icon, color }) => (
                <div key={label} className="bg-[#101217] p-6 sm:p-7">
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>{label}</span>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <p className="mt-5 text-3xl font-medium tracking-[-0.05em] text-white">
                    {value}
                  </p>
                  <p className="mt-2 text-xs" style={{ color }}>
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-white/[0.08] bg-[#101217] p-6 sm:p-7">
                <div className="flex justify-between">
                  <div>
                    <p className="text-[11px] text-white/40">Network activity</p>
                    <p className="mt-1 text-sm text-white">Transaction safety score</p>
                  </div>
                  <span className="rounded-md bg-[#6dce9a]/10 px-2 py-1 text-[10px] text-[#6dce9a]">
                    Last 10 days
                  </span>
                </div>
                <div className="mt-6 flex h-24 items-end gap-1.5">
                  {safetyBuckets.map((bucket, index) => (
                    <div
                      key={index}
                      className={`flex-1 rounded-t ${
                        bucket.safety === null
                          ? 'bg-white/10'
                          : bucket.safety >= 70
                            ? 'bg-[#6dce9a]'
                            : bucket.safety >= 40
                              ? 'bg-[#ffb15c]'
                              : 'bg-[#ff6257]'
                      }`}
                      style={{
                        height: `${bucket.height}%`,
                        opacity: bucket.safety === null ? 0.3 : 0.55 + index / 30,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#101217] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/40">Recent alerts</p>
                  <Link
                    href="/alerts"
                    className="inline-flex items-center gap-1 text-[11px] text-white/45 transition-colors hover:text-white"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="mt-4 space-y-4">
                  {recentAlerts.length === 0 ? (
                    <p className="text-xs text-white/35">No alerts yet.</p>
                  ) : (
                    recentAlerts.map((alert) => {
                      const meta = alertMeta(alert.type);
                      return (
                        <div key={alert.id} className="flex gap-3">
                          <span
                            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <div>
                            <p className="text-[11px] text-white">{alertTitle(alert.type)}</p>
                            <p className="mt-1 text-[10px] text-white/35">{alert.message}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
