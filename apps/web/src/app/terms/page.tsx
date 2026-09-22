import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Tutela',
};

const SECTIONS = [
  { id: 'acceptance', title: 'Acceptance of these terms' },
  { id: 'what-tutela-does', title: 'What Tutela does' },
  { id: 'access-and-accounts', title: 'Access and accounts' },
  { id: 'plans-and-limits', title: 'Plans and limits' },
  { id: 'acceptable-use', title: 'Acceptable use' },
  { id: 'no-guarantee', title: 'No financial or security guarantee' },
  { id: 'third-party-services', title: 'Third-party services' },
  { id: 'limitation-of-liability', title: 'Limitation of liability' },
  { id: 'changes-to-terms', title: 'Changes to these terms' },
  { id: 'contact', title: 'Contact' },
];

function Bullet() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6dce9a]" />;
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl gap-12">
        <div className="hidden w-52 shrink-0 lg:block" aria-hidden="true" />
        <aside className="fixed top-[76px] left-[max(2.5rem,calc(50%_-_32rem))] hidden h-[calc(100vh-76px)] w-52 flex-col justify-center lg:flex">
          <p className="text-[11px] tracking-[0.16em] text-white/30 uppercase">On this page</p>
          <nav className="mt-4 space-y-4 text-xs">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-white/50 transition-colors hover:text-white"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 max-w-3xl flex-1">
          <div className="border-b border-white/[0.08] pb-8">
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6dce9a]" />
              Legal
            </div>
            <h1 className="font-sans text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-5 text-sm text-white/40">Last updated September 17, 2026</p>
          </div>

          <div className="mt-10 flex flex-col gap-10 text-sm leading-6 text-white/60">
            <section id="acceptance" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Acceptance of these terms
              </h2>
              <p className="mt-3">
                By connecting a wallet to Tutela or otherwise using the service, you agree to
                these Terms of Service. If you do not agree, do not use Tutela.
              </p>
            </section>

            <section id="what-tutela-does" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                What Tutela does
              </h2>
              <p className="mt-3">
                Tutela is a monitoring service for EVM-compatible wallets. It watches public
                on-chain activity for wallets you register, surfaces risk signals for approvals
                and transactions, and can prepare (but never automatically send) revocation
                transactions for you to review and sign yourself. Tutela is read-only: it never
                requests, stores, or has the ability to use your seed phrase or private key, and
                it cannot move funds or sign transactions on your behalf.
              </p>
            </section>

            <section id="access-and-accounts" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Access and accounts
              </h2>
              <p className="mt-3">
                Tutela does not use passwords or email addresses. You sign in by signing a
                one-time message with your wallet. Anyone who controls the private key for a
                wallet you registered can access the associated Tutela account for that wallet.
              </p>
            </section>

            <section id="plans-and-limits" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Plans and limits
              </h2>
              <p className="mt-3">
                Tutela offers a free plan with a limited number of monitored wallets and paid
                plans with higher or unlimited limits and additional features. We may change plan
                limits, pricing, or features at any time; material changes will be reflected on
                the pricing page.
              </p>
            </section>

            <section id="acceptable-use" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Acceptable use
              </h2>
              <p className="mt-3">
                You agree not to misuse Tutela — including attempting to disrupt the service,
                circumvent plan limits, or use it to monitor wallets you do not have a legitimate
                interest in tracking.
              </p>
            </section>

            <section id="no-guarantee" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                No financial or security guarantee
              </h2>
              <p className="mt-3">
                Tutela provides risk signals and information to help you make decisions about
                your own wallet activity. It is not financial, legal, or security advice, and it
                cannot guarantee that it will detect every risk or prevent every loss. You are
                solely responsible for the wallets you control and the transactions you sign.
              </p>
            </section>

            <section id="third-party-services" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Third-party services
              </h2>
              <p className="mt-3">
                Tutela relies on third-party infrastructure to operate, including blockchain data
                providers, messaging platforms (such as Telegram, if you choose to link it), and
                hosting providers. Your use of those third-party services is also subject to
                their own terms.
              </p>
            </section>

            <section id="limitation-of-liability" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Limitation of liability
              </h2>
              <p className="mt-3">
                Tutela is provided &quot;as is&quot; without warranties of any kind. To the
                fullest extent permitted by law, Tutela and its operator are not liable for any
                indirect, incidental, or consequential damages arising from your use of the
                service, including losses related to on-chain transactions.
              </p>
            </section>

            <section id="changes-to-terms" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Changes to these terms
              </h2>
              <p className="mt-3">
                We may update these terms as Tutela evolves. Continued use of the service after a
                change means you accept the updated terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24">
              <h2 className="flex items-center gap-2 text-base font-medium text-white">
                <Bullet />
                Contact
              </h2>
              <p className="mt-3">
                Questions about these terms can be sent to{' '}
                <a
                  href="mailto:officialoladayooladoyin@gmail.com"
                  className="text-white transition-colors hover:text-[#6dce9a]"
                >
                  officialoladayooladoyin@gmail.com
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-white/[0.08] pt-6 text-xs text-white/35">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Read the Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
