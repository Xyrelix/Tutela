'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Alert } from '@/lib/api-client';

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    walletId: 'mock-alex',
    type: 'critical_approval',
    message: 'Unlimited USDC approval detected on an unknown contract. Review before signing.',
    sent: false,
    createdAt: '2026-09-12T09:41:00.000Z',
    wallet: { address: '0x71C7...4A2E', chain: 'ethereum' },
  },
  {
    id: 'alert-2',
    walletId: 'mock-treasury',
    type: 'risk_score_changed',
    message: 'Risk score moved from 34 to 68 after a new contract interaction.',
    sent: true,
    createdAt: '2026-09-12T08:18:00.000Z',
    wallet: { address: '0x8B2F...91C0', chain: 'base' },
  },
  {
    id: 'alert-3',
    walletId: 'mock-vault',
    type: 'wallet_secured',
    message: 'Revocation confirmed. The DAI allowance is no longer active.',
    sent: true,
    createdAt: '2026-09-11T16:04:00.000Z',
    wallet: { address: '0x4D90...C81B', chain: 'ethereum' },
  },
  {
    id: 'alert-4',
    walletId: 'mock-alex',
    type: 'new_activity',
    message: 'A monitored wallet interacted with a contract for the first time.',
    sent: true,
    createdAt: '2026-09-10T13:27:00.000Z',
    wallet: { address: '0x71C7...4A2E', chain: 'ethereum' },
  },
];

function alertMeta(type: string) {
  if (type.includes('critical')) return { label: 'Critical', color: '#ff6257', icon: ShieldAlert };
  if (type.includes('risk')) return { label: 'Review', color: '#ffb15c', icon: AlertTriangle };
  if (type.includes('secured')) return { label: 'Protected', color: '#6dce9a', icon: ShieldCheck };
  return { label: 'Activity', color: '#8b9eff', icon: Bell };
}

function alertTitle(type: string) {
  return type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [notice, setNotice] = useState<string | null>(null);

  const visibleAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
        const isCritical = alert.type.includes('critical');
        const isProtected = alert.type.includes('secured');
        const matchesFilter =
          filter === 'all' ||
          (filter === 'urgent' && isCritical) ||
          (filter === 'protected' && isProtected) ||
          (filter === 'unread' && !alert.sent);
        const haystack =
          `${alert.type} ${alert.message} ${alert.wallet.address} ${alert.wallet.chain}`.toLowerCase();
        return matchesFilter && haystack.includes(query.toLowerCase());
      }),
    [alerts, filter, query]
  );

  const urgentCount = alerts.filter((alert) => alert.type.includes('critical')).length;
  const unreadCount = alerts.filter((alert) => !alert.sent).length;
  const protectedCount = alerts.filter((alert) => alert.type.includes('secured')).length;

  function resolveAlert(id: string) {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
    setNotice('Alert cleared from your active view.');
  }

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#ff6257] uppercase">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6257]" />
              Security operations
            </div>
            <h1 className="font-instrument-serif text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              Stay ahead of
              <br />
              <span className="text-white/40">the important things.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
              A calm, prioritized view of the events that need your attention across every monitored
              wallet.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#6dce9a]/20 bg-[#6dce9a]/[0.06] px-4 py-2 text-xs text-[#6dce9a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" />
            Systems operational
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {[
            ['Urgent alerts', urgentCount, 'Action recommended', ShieldAlert, '#ff6257'],
            ['Unreviewed', unreadCount, 'Awaiting your attention', Bell, '#ffb15c'],
            [
              'Wallets secured',
              protectedCount,
              'Recent protective actions',
              ShieldCheck,
              '#6dce9a',
            ],
          ].map(([label, value, detail, Icon, color]) => (
            <div key={label as string} className="bg-[#101217] p-6 sm:p-7">
              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>{label as string}</span>
                <Icon className="h-4 w-4" style={{ color: color as string }} />
              </div>
              <p className="mt-5 text-3xl font-medium tracking-[-0.05em]">{value as number}</p>
              <p className="mt-2 text-xs" style={{ color: `${color as string}cc` }}>
                {detail as string}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-medium tracking-[-0.03em]">Alert stream</h2>
              <p className="mt-1 text-xs text-white/35">
                Prioritized events from your protection layer.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/35">
                <Search className="h-3.5 w-3.5" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search alerts"
                  className="w-24 bg-transparent text-white outline-none placeholder:text-white/25"
                />
              </label>
              <div className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                <Filter className="mx-2 h-3.5 w-3.5 text-white/30" />
                {[
                  ['all', 'All'],
                  ['urgent', 'Urgent'],
                  ['unread', 'Unread'],
                  ['protected', 'Protected'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded px-2 py-1 text-[11px] ${filter === value ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {visibleAlerts.map((alert) => {
              const meta = alertMeta(alert.type);
              const Icon = meta.icon;
              return (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#101217] p-5 transition-colors hover:border-white/20 sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"
                      style={{ color: meta.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium">{alertTitle(alert.type)}</h3>
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] tracking-[0.12em] uppercase"
                            style={{ color: meta.color, backgroundColor: `${meta.color}14` }}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <time className="flex items-center gap-1 text-[10px] text-white/30">
                          <Clock3 className="h-3 w-3" />
                          {new Date(alert.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
                        {alert.message}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                        <p className="text-xs text-white/35">
                          <span className="font-mono text-white/55">{alert.wallet.address}</span> ·{' '}
                          {alert.wallet.chain} · {alert.sent ? 'Delivered' : 'Awaiting review'}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => resolveAlert(alert.id)}
                            className="inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-[#6dce9a]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Clear alert
                          </button>
                          <a
                            href="/risk-feed"
                            className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white"
                          >
                            View signal <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {visibleAlerts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/45">
              No alerts match this view.
            </div>
          )}
        </section>

        {notice && (
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="fixed right-5 bottom-5 z-30 flex items-center gap-3 rounded-xl border border-[#6dce9a]/30 bg-[#111a17] px-4 py-3 text-xs text-[#b8f0d1] shadow-2xl"
          >
            <Check className="h-4 w-4" />
            {notice}
            <X className="ml-2 h-3.5 w-3.5 opacity-50" />
          </button>
        )}
      </div>
    </main>
  );
}
