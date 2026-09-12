'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateWallet, setToken } from '@/lib/api-client';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = await authenticateWallet('login');
      setToken(token);
      router.push('/wallets');
    } catch {
      setError(
        'Could not verify this wallet. Make sure it has a Tutela account and approve the signature request.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-8">
      <h1 className="mb-2 text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-zinc-500">Use your wallet address to access Tutela.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {submitting ? 'Verifying wallet…' : 'Verify wallet'}
        </button>
      </form>
    </div>
  );
}
