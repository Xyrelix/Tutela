'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, getToken, listAlerts } from '@/lib/api-client';

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    listAlerts().then(setAlerts).catch(() => setError('Could not load alert history.'));
  }, [router]);

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8"><div><h1 className="text-xl font-semibold">Alerts</h1><p className="mt-1 text-sm text-zinc-500">Every security alert generated for your monitored wallets.</p></div>{error && <p className="text-sm text-red-600">{error}</p>}{alerts === null && !error && <p className="text-sm text-zinc-500">Loading alert history...</p>}{alerts?.length === 0 && <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">No alerts recorded yet.</p>}{alerts && alerts.length > 0 && <div className="space-y-3">{alerts.map((alert) => <article key={alert.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-4"><h2 className="text-sm font-medium">{alert.type.replaceAll('_', ' ')}</h2><time className="text-xs text-zinc-500">{new Date(alert.createdAt).toLocaleString()}</time></div><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{alert.message}</p><p className="mt-3 text-xs text-zinc-500">{alert.sent ? 'Delivered' : 'Pending delivery'} · {alert.wallet.chain}</p></article>)}</div>}</div>;
}
