'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, listScans, Scan } from '@/lib/api-client';

function scoreClass(score: number) {
  return score >= 80 ? 'text-red-600' : score >= 50 ? 'text-amber-600' : 'text-emerald-600';
}

export default function RiskFeedPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    listScans()
      .then(setScans)
      .catch(() => setError('Could not load risk history.'));
  }, [router]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Risk Feed</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Recent wallet scans and the reasoning behind each verdict.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {scans === null && !error && <p className="text-sm text-zinc-500">Loading risk history...</p>}
      {scans?.length === 0 && (
        <p className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-zinc-500 dark:border-white/15">
          No scans recorded yet.
        </p>
      )}
      {scans && scans.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-black/10 px-4 py-3 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:border-white/10">
            <span>Wallet / verdict</span>
            <span>Score</span>
            <span>Time</span>
          </div>
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-black/5 px-4 py-4 last:border-0 dark:border-white/5"
            >
              <div>
                <p className="font-mono text-sm">{scan.wallet.address}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {scan.verdict} · {scan.reasoning || 'No additional reasoning'}
                </p>
              </div>
              <span className={`font-semibold ${scoreClass(scan.riskScore)}`}>
                {scan.riskScore}
              </span>
              <time className="text-xs text-zinc-500">
                {new Date(scan.createdAt).toLocaleString()}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
