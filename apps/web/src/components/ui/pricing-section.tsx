'use client';

import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCheck, Database, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Scout',
    description: 'A clear first layer of protection for the wallets that matter most.',
    monthly: 0,
    yearly: 0,
    features: ['3 monitored wallets', 'Risk feed', 'Email alerts'],
    includes: [
      'Free includes:',
      'Continuous wallet watch',
      'Risk context before you sign',
      'Basic alert history',
    ],
  },
  {
    name: 'Sentinel',
    description: 'Faster response loops for teams that need more control and context.',
    monthly: 29,
    yearly: 278,
    featured: true,
    features: ['25 monitored wallets', 'Approval intelligence', 'Prepared revocations'],
    includes: [
      'Everything in Scout, plus:',
      'Telegram alerts',
      'Team access',
      'Priority response signals',
    ],
  },
  {
    name: 'Command',
    description: 'A deeper security command layer for treasury operations at scale.',
    monthly: 99,
    yearly: 950,
    features: ['Unlimited wallets', 'Custom policies', 'Advanced monitoring'],
    includes: [
      'Everything in Sentinel, plus:',
      'Custom risk rules',
      'Multi-wallet operations',
      'Dedicated support',
    ],
  },
];

const featureIcons = [ShieldCheck, Database, Zap];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#090a0d] px-5 py-28 text-white sm:px-8 lg:px-10"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(36,87,255,0.14),transparent_68%)]" />
        <div className="relative mx-auto mb-12 max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.22em] text-[#6dce9a] uppercase"
          >
            Simple by design
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 font-sans text-5xl leading-none tracking-[-0.05em] sm:text-7xl"
          >
            Protection that
            <br />
            <span className="text-white/40">scales with you.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/45"
          >
            Start with the essentials, then add the response power your wallet operations need.
          </motion.p>
        </div>

        <div className="relative mb-8 flex justify-center">
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {[
              ['monthly', 'Monthly'],
              ['yearly', 'Yearly · save 20%'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setIsYearly(value === 'yearly')}
                className={`rounded-full px-4 py-2 text-xs transition-colors sm:px-5 ${isYearly === (value === 'yearly') ? 'bg-white text-black' : 'text-white/45 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = featureIcons[index];
            return (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.1 }}
                className={`relative rounded-2xl border p-7 ${plan.featured ? 'border-[#2457ff]/60 bg-[#111725] shadow-[0_20px_80px_rgba(36,87,255,0.12)]' : 'border-white/[0.09] bg-[#101217]'}`}
              >
                {plan.featured && (
                  <span className="absolute top-6 right-6 rounded-full bg-[#2457ff] px-2.5 py-1 text-[10px] font-medium">
                    Most popular
                  </span>
                )}
                <Icon
                  className={`h-5 w-5 ${plan.featured ? 'text-[#6dce9a]' : 'text-[#8b9eff]'}`}
                />
                <h2 className="mt-7 text-xl font-medium tracking-[-0.03em]">{plan.name}</h2>
                <p className="mt-3 min-h-12 text-sm leading-5 text-white/40">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-medium tracking-[-0.05em]">
                    <span className="text-white/50">$</span>
                    <NumberFlow value={isYearly ? plan.yearly : plan.monthly} />
                  </span>
                  <span className="text-sm text-white/35">/{isYearly ? 'year' : 'month'}</span>
                </div>
                <Link
                  href="/register"
                  className={`mt-7 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium ${plan.featured ? 'bg-[#2457ff] text-white' : 'border border-white/10 text-white/70 hover:border-white/25 hover:text-white'}`}
                >
                  Get started <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <ul className="mt-8 space-y-3 border-t border-white/[0.08] pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-white/55">
                      <CheckCheck className="h-3.5 w-3.5 text-[#6dce9a]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 border-t border-white/[0.08] pt-6">
                  <p className="text-xs font-medium text-white/70">{plan.includes[0]}</p>
                  <ul className="mt-4 space-y-3">
                    {plan.includes.slice(1).map((feature) => (
                      <li key={feature} className="text-xs text-white/40">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
