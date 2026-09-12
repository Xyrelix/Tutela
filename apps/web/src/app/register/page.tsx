'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateWallet, setToken } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = await authenticateWallet('register');
      setToken(token);
      router.push('/wallets');
    } catch {
      setError(
        'Could not verify this wallet. Connect an available wallet and approve the signature request.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-8">
      <h1 className="mb-2 text-xl font-semibold">Protect a wallet</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Create your Tutela account with a wallet address.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {submitting ? 'Verifying wallet…' : 'Create account with wallet'}
        </button>
      </form>
    </div>
  );
}
