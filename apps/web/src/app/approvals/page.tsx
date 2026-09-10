'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Approval,
  confirmRevoke,
  getToken,
  listApprovals,
  prepareRevoke,
  UnsignedTransaction,
} from '@/lib/api-client';

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[] | null>(null);
  const [prepared, setPrepared] = useState<Record<string, UnsignedTransaction>>({});
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    listApprovals().then(setApprovals).catch(() => setError('Could not load approvals.'));
  }, [router]);

  async function handlePrepare(approvalId: string) {
    setBusyId(approvalId);
    setError(null);
    try {
      const transaction = await prepareRevoke(approvalId);
      setPrepared((current) => ({ ...current, [approvalId]: transaction }));
    } catch {
      setError('Could not prepare the revoke transaction.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirm(approvalId: string) {
    const txHash = txHashes[approvalId]?.trim();
    if (!txHash) { setError('Enter the broadcast transaction hash first.'); return; }
    setBusyId(approvalId);
    setError(null);
    try {
      const updated = await confirmRevoke(approvalId, txHash);
      setApprovals((current) => current?.map((approval) => approval.id === updated.id ? updated : approval) ?? current);
    } catch {
      setError('Could not confirm the revoke. Check the transaction hash.');
    } finally {
      setBusyId(null);
    }
  }

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8"><div><h1 className="text-xl font-semibold">Approvals</h1><p className="mt-1 text-sm text-zinc-500">Review allowances and prepare a user-signed revoke transaction.</p></div>{error && <p className="text-sm text-red-600">{error}</p>}{approvals === null && !error && <p className="text-sm text-zinc-500">Loading approvals...</p>}{approvals?.length === 0 && <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">No approvals recorded yet.</p>}{approvals && approvals.length > 0 && <div className="space-y-4">{approvals.map((approval) => { const transaction = prepared[approval.id]; const active = approval.status === 'active'; return <article key={approval.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-sm">{approval.tokenAddress}</p><p className="mt-1 text-xs text-zinc-500">Spender: {approval.spender}</p><p className="mt-1 text-xs text-zinc-500">Wallet: {approval.wallet.address} · {approval.wallet.chain}</p></div><span className={`rounded-full px-2 py-1 text-xs ${active ? 'bg-amber-500/10 text-amber-700' : 'bg-emerald-500/10 text-emerald-700'}`}>{approval.status}</span></div>{active && !transaction && <button onClick={() => handlePrepare(approval.id)} disabled={busyId === approval.id} className="mt-5 rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">{busyId === approval.id ? 'Preparing...' : 'Prepare revoke'}</button>}{transaction && active && <div className="mt-5 space-y-3 rounded-md bg-black/[.04] p-3 dark:bg-white/[.06]"><p className="text-xs text-zinc-500">Send this transaction from the connected wallet:</p><p className="break-all font-mono text-xs">To: {transaction.to}</p><p className="break-all font-mono text-xs">Data: {transaction.data}</p><div className="flex flex-col gap-2 sm:flex-row"><input value={txHashes[approval.id] ?? ''} onChange={(event) => setTxHashes((current) => ({ ...current, [approval.id]: event.target.value }))} placeholder="Broadcast transaction hash" className="min-w-0 flex-1 rounded border border-black/20 bg-transparent px-3 py-2 font-mono text-xs dark:border-white/20" /><button onClick={() => handleConfirm(approval.id)} disabled={busyId === approval.id} className="rounded bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50">{busyId === approval.id ? 'Confirming...' : 'Confirm revoke'}</button></div></div>}</article>; })}</div>}</div>;
}
