import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Tutela',
};

const SECTIONS = [
  { id: 'overview', title: '1. Overview' },
  { id: 'information-we-collect', title: '2. Information we collect' },
  { id: 'how-we-use-this-information', title: '3. How we use this information' },
  { id: 'third-parties', title: '4. Third parties we rely on' },
  { id: 'data-retention', title: '5. Data retention' },
  { id: 'your-choices', title: '6. Your choices' },
  { id: 'security', title: '7. Security' },
  { id: 'childrens-privacy', title: "8. Children's privacy" },
  { id: 'changes-to-policy', title: '9. Changes to this policy' },
  { id: 'contact', title: '10. Contact' },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#090a0d] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl gap-12">
        <aside className="sticky top-10 hidden h-fit w-52 shrink-0 lg:block">
          <p className="text-[11px] tracking-[0.16em] text-white/30 uppercase">On this page</p>
          <nav className="mt-4 space-y-2.5 text-xs">
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
            <div className="mb-5 flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#8b9eff] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8b9eff]" />
              Legal
            </div>
            <h1 className="font-sans text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-5 text-sm text-white/40">Last updated September 17, 2026</p>
          </div>

          <div className="mt-10 flex flex-col gap-10 text-sm leading-6 text-white/60">
            <section id="overview">
              <h2 className="text-base font-medium text-white">1. Overview</h2>
              <p className="mt-3">
                Tutela is built around a simple principle: we collect as little as possible.
                There are no passwords, no email addresses, and no seed phrases or private keys
                anywhere in the system. This policy explains what we do collect and why.
              </p>
            </section>

            <section id="information-we-collect">
              <h2 className="text-base font-medium text-white">2. Information we collect</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <span className="text-white/80">Wallet addresses</span> you register for
                  monitoring, and the on-chain activity (approvals, transfers, contract
                  interactions) associated with them — all of which is already public on the
                  blockchain.
                </li>
                <li>
                  <span className="text-white/80">Signed authentication messages</span> used to
                  verify you control a wallet when you sign in. These are single-use and are not
                  reusable once consumed.
                </li>
                <li>
                  <span className="text-white/80">Telegram chat ID</span>, only if you choose to
                  link Telegram alerts. You can unlink it at any time from your account settings.
                </li>
                <li>
                  <span className="text-white/80">Basic technical data</span> (such as request
                  logs and IP addresses) that our hosting and infrastructure providers collect
                  automatically to operate and secure the service.
                </li>
              </ul>
            </section>

            <section id="how-we-use-this-information">
              <h2 className="text-base font-medium text-white">3. How we use this information</h2>
              <p className="mt-3">
                We use this information to monitor the wallets you register, evaluate the risk of
                approvals and transactions, send alerts through the channels you&apos;ve linked,
                and operate and improve the service. We do not sell your information.
              </p>
            </section>

            <section id="third-parties">
              <h2 className="text-base font-medium text-white">4. Third parties we rely on</h2>
              <p className="mt-3">
                Tutela uses third-party infrastructure to function, including a blockchain data
                provider to detect on-chain activity, Telegram (if you link it) to deliver
                alerts, an AI-assisted service to help evaluate ambiguous risk signals, and
                hosting providers to run the application. Each of these providers only receives
                the data necessary to perform its function.
              </p>
            </section>

            <section id="data-retention">
              <h2 className="text-base font-medium text-white">5. Data retention</h2>
              <p className="mt-3">
                We retain wallet, scan, approval, and alert records for as long as your account
                is active, so that your risk feed and alert history remain useful. On-chain data
                itself is public and permanent regardless of what Tutela stores.
              </p>
            </section>

            <section id="your-choices">
              <h2 className="text-base font-medium text-white">6. Your choices</h2>
              <p className="mt-3">
                You can remove a monitored wallet at any time from the Wallets page, and unlink
                Telegram from Settings. To request deletion of your remaining account data,
                contact us using the email below.
              </p>
            </section>

            <section id="security">
              <h2 className="text-base font-medium text-white">7. Security</h2>
              <p className="mt-3">
                Access to Tutela is protected by wallet-signature authentication rather than a
                password. We take reasonable technical measures to protect the data we do hold,
                but no online service can guarantee absolute security.
              </p>
            </section>

            <section id="childrens-privacy">
              <h2 className="text-base font-medium text-white">8. Children&apos;s privacy</h2>
              <p className="mt-3">
                Tutela is not directed at children and is not intended for use by anyone under
                the age required to hold and manage their own cryptocurrency wallet under
                applicable law.
              </p>
            </section>

            <section id="changes-to-policy">
              <h2 className="text-base font-medium text-white">9. Changes to this policy</h2>
              <p className="mt-3">
                We may update this policy as Tutela evolves. We&apos;ll update the date at the
                top of this page when we do.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-base font-medium text-white">10. Contact</h2>
              <p className="mt-3">
                Questions about this policy, or requests about your data, can be sent to{' '}
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
            <Link href="/terms" className="transition-colors hover:text-white">
              Read the Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
