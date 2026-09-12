'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Scan } from '@/lib/api-client';

const MOCK_SCANS: Scan[] = [
  {
    id: 'scan-1',
    walletId: 'mock-alex',
    txHash: '0x91...3a1',
    riskScore: 92,
    verdict: 'Critical approval',
    reasoning: 'High allowance · unknown deployer · empty contract history',
    createdAt: '2026-09-12T09:41:00.000Z',
    wallet: { address: '0x71C7...4A2E', chain: 'ethereum' },
  },
  {
    id: 'scan-2',
    walletId: 'mock-treasury',
    txHash: '0x72...d91',
    riskScore: 68,
    verdict: 'Review recommended',
    reasoning: 'New contract · moderate allowance · first interaction',
    createdAt: '2026-09-12T08:18:00.000Z',
    wallet: { address: '0x8B2F...91C0', chain: 'base' },
  },
  {
    id: 'scan-3',
    walletId: 'mock-vault',
    txHash: '0x44...be2',
    riskScore: 18,
    verdict: 'Looks safe',
    reasoning: 'Known protocol · established deployer · normal allowance',
    createdAt: '2026-09-11T16:04:00.000Z',
    wallet: { address: '0x4D90...C81B', chain: 'ethereum' },
  },
  {
    id: 'scan-4',
    walletId: 'mock-alex',
    txHash: '0x11...8f4',
    riskScore: 41,
    verdict: 'Low confidence',
    reasoning: 'Limited contract history · no malicious signals found',
    createdAt: '2026-09-10T13:27:00.000Z',
    wallet: { address: '0x71C7...4A2E', chain: 'ethereum' },
  },
];

function riskMeta(score: number) {
  if (score >= 80) return { label: 'Critical', color: '#ff6257', icon: ShieldAlert };
  if (score >= 50) return { label: 'Review', color: '#ffb15c', icon: AlertTriangle };
  return { label: 'Clear', color: '#6dce9a', icon: CheckCircle2 };
}

export default function RiskFeedPage() {
  const [scans] = useState(MOCK_SCANS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const visibleScans = useMemo(
    () =>
      scans.filter((scan) => {
        const matchesFilter =
          filter === 'all' ||
          (filter === 'critical' && scan.riskScore >= 80) ||
          (filter === 'review' && scan.riskScore >= 50 && scan.riskScore < 80) ||
          (filter === 'clear' && scan.riskScore < 50);
        const haystack =
          `${scan.wallet.address} ${scan.wallet.chain} ${scan.verdict} ${scan.reasoning}`.toLowerCase();
        return matchesFilter && haystack.includes(query.toLowerCase());
      }),
    [filter, query, scans]
  );

  const critical = scans.filter((scan) => scan.riskScore >= 80).length;
  const review = scans.filter((scan) => scan.riskScore >= 50 && scan.riskScore < 80).length;
  const clear = scans.filter((scan) => scan.riskScore < 50).length;

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#ffb15c] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffb15c]" />
              Live risk intelligence
            </div>
            <h1 className="font-sans text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              The signal
              <br />
              <span className="text-white/40">behind every sign.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
              A running history of wallet scans, risk scores, and the reasoning behind each
              decision.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#6dce9a]/20 bg-[#6dce9a]/[0.06] px-4 py-2 text-xs text-[#6dce9a]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#6dce9a]" />
            Monitoring active
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {[
            ['Critical signals', critical, 'Needs attention now', ShieldAlert, '#ff6257'],
            ['Review signals', review, 'Worth a closer look', AlertTriangle, '#ffb15c'],
            ['Clear signals', clear, 'No action needed', ShieldCheck, '#6dce9a'],
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
              <h2 className="text-lg font-medium tracking-[-0.03em]">Recent scans</h2>
              <p className="mt-1 text-xs text-white/35">
                Risk engine decisions across your monitored wallets.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white/35">
                <Search className="h-3.5 w-3.5" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search scans"
                  className="w-24 bg-transparent text-white outline-none placeholder:text-white/25"
                />
              </label>
              <div className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
                <Filter className="mx-2 h-3.5 w-3.5 text-white/30" />
                {[
                  ['all', 'All'],
                  ['critical', 'Critical'],
                  ['review', 'Review'],
                  ['clear', 'Clear'],
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
            {visibleScans.map((scan) => {
              const meta = riskMeta(scan.riskScore);
              const Icon = meta.icon;
              return (
                <article
                  key={scan.id}
                  className="rounded-2xl border border-white/[0.08] bg-[#101217] p-5 transition-colors hover:border-white/20 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]"
                        style={{ color: meta.color }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-sm">{scan.wallet.address}</p>
                          <span className="text-[10px] text-white/30">{scan.wallet.chain}</span>
                        </div>
                        <p className="mt-2 text-sm text-white/75">{scan.verdict}</p>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">
                          {scan.reasoning}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-8 border-t border-white/[0.07] pt-4 lg:border-t-0 lg:pt-0">
                      <div>
                        <p className="text-[10px] tracking-[0.16em] text-white/30 uppercase">
                          Risk score
                        </p>
                        <p className="mt-1 text-2xl font-medium" style={{ color: meta.color }}>
                          {scan.riskScore}
                          <span className="text-xs text-white/25"> / 100</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-[10px] text-white/30">
                          <Clock3 className="h-3 w-3" />
                          {new Date(scan.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                        <a
                          href={`https://etherscan.io/tx/${scan.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-white/45 hover:text-white"
                        >
                          View transaction <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {visibleScans.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center text-sm text-white/45">
              No scans match this view.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
