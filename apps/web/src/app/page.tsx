import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tutela</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        A persistent monitoring agent for EVM wallets: watches registered wallets for risky token
        approvals and drainer contracts, then alerts you and can prepare revocation transactions.
      </p>
      <div className="flex gap-4 text-sm">
        <Link href="/login" className="underline">
          Log in
        </Link>
        <Link href="/register" className="underline">
          Register
        </Link>
      </div>
    </div>
  );
}
