'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Approval } from '@/lib/api-client';

const MOCK_APPROVALS: Approval[] = [
  {
    id: 'approval-1',
    walletId: 'mock-alex',
    spender: '0x9D31...A80F',
    tokenAddress: 'USDC',
    amount: 'Unlimited',
    status: 'active',
    revokeTxHash: null,
    detectedAt: '2026-09-12T09:41:00.000Z',
    wallet: { address: '0x71C7...4A2E', chain: 'ethereum' },
  },
  {
    id: 'approval-2',
    walletId: 'mock-treasury',
    spender: '0xA44C...19E2',
    tokenAddress: 'WETH',
    amount: '12.50 WETH',
    status: 'active',
    revokeTxHash: null,
    detectedAt: '2026-09-11T17:12:00.000Z',
    wallet: { address: '0x8B2F...91C0', chain: 'base' },
  },
  {
    id: 'approval-3',
    walletId: 'mock-vault',
    spender: '0x72F0...C114',
    tokenAddress: 'DAI',
    amount: '4,200 DAI',
    status: 'revoked',
    revokeTxHash: '0x31...c82',
    detectedAt: '2026-09-09T12:06:00.000Z',
    wallet: { address: '0x4D90...C81B', chain: 'ethereum' },
  },
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [prepared, setPrepared] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const activeCount = approvals.filter((approval) => approval.status === 'active').length;

  function handlePrepare(approval: Approval) {
    setPrepared((current) => ({ ...current, [approval.id]: true }));
    setNotice(`Revoke transaction prepared for ${approval.tokenAddress}.`);
  }

  function handleConfirm(approval: Approval) {
    setApprovals((current) =>
      current.map((item) =>
        item.id === approval.id
          ? { ...item, status: 'revoked', revokeTxHash: '0xDEMO...7F42' }
          : item
      )
    );
    setPrepared((current) => ({ ...current, [approval.id]: false }));
    setNotice(`${approval.tokenAddress} approval revoked in demo mode.`);
  }

  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#ffb15c] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffb15c]" />
              Approval control
            </div>
            <h1 className="font-instrument-serif text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
              Know what can
              <br />
              <span className="text-white/40">move your funds.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
              Review every allowance, understand the exposure, and prepare the next protective
              action.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#ffb15c]/20 bg-[#ffb15c]/[0.06] px-4 py-2 text-xs text-[#ffcb8b]">
            <ShieldAlert className="h-3.5 w-3.5" />
            {activeCount} active approvals
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
          {[
            ['Active approvals', activeCount, 'Review before signing', ShieldAlert, '#ffb15c'],
            [
              'Protected approvals',
              approvals.length - activeCount,
              'Revoked by your team',
              ShieldCheck,
              '#6dce9a',
            ],
            [
              'Wallets covered',
              new Set(approvals.map((approval) => approval.walletId)).size,
              'Across monitored chains',
              ClipboardCheck,
              '#8b9eff',
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
          <div className="mb-5">
            <h2 className="text-lg font-medium tracking-[-0.03em]">Allowance inventory</h2>
            <p className="mt-1 text-xs text-white/35">
              Prepared actions are simulated until wallet signing is enabled.
            </p>
          </div>
          <div className="space-y-3">
            {approvals.map((approval) => {
              const active = approval.status === 'active';
              const isPrepared = prepared[approval.id];
              return (
                <article
                  key={approval.id}
                  className={`rounded-2xl border bg-[#101217] p-5 sm:p-6 ${active ? 'border-white/[0.08]' : 'border-[#6dce9a]/20'}`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${active ? 'border-[#ffb15c]/25 bg-[#ffb15c]/[0.08] text-[#ffb15c]' : 'border-[#6dce9a]/25 bg-[#6dce9a]/[0.08] text-[#6dce9a]'}`}
                      >
                        <KeyRound className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-medium">{approval.tokenAddress}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] tracking-[0.12em] uppercase ${active ? 'bg-[#ffb15c]/10 text-[#ffcb8b]' : 'bg-[#6dce9a]/10 text-[#6dce9a]'}`}
                          >
                            {active ? 'Needs review' : 'Protected'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                          Spender{' '}
                          <span className="font-mono text-white/60">{approval.spender}</span>
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {approval.wallet.address} · {approval.wallet.chain} · Detected{' '}
                          {new Date(approval.detectedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 border-t border-white/[0.07] pt-4 lg:border-t-0 lg:pt-0">
                      <div>
                        <p className="text-[10px] tracking-[0.16em] text-white/30 uppercase">
                          Allowance
                        </p>
                        <p
                          className={`mt-1 text-lg font-medium ${approval.amount === 'Unlimited' ? 'text-[#ffb15c]' : 'text-white'}`}
                        >
                          {approval.amount}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] tracking-[0.16em] text-white/30 uppercase">
                          Status
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                          {active ? (
                            <ShieldAlert className="h-3.5 w-3.5 text-[#ffb15c]" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#6dce9a]" />
                          )}
                          {approval.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  {active && (
                    <div className="mt-5 border-t border-white/[0.07] pt-4">
                      {!isPrepared ? (
                        <button
                          type="button"
                          onClick={() => handlePrepare(approval)}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#2457ff] px-4 py-2.5 text-xs font-medium transition-transform hover:scale-[1.02]"
                        >
                          Prepare revoke <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#2457ff]/30 bg-[#2457ff]/[0.07] p-4 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-xs text-[#aabaff]">Demo transaction ready</p>
                            <p className="mt-1 font-mono text-[10px] text-white/40">
                              To: 0xRevoke...Tutela
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleConfirm(approval)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6dce9a] px-4 py-2 text-xs font-medium text-[#08110d]"
                          >
                            Confirm demo revoke <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {!active && approval.revokeTxHash && (
                    <a
                      href={`https://etherscan.io/tx/${approval.revokeTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white"
                    >
                      View revoke transaction <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
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
