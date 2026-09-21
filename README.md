# Tutela

An AI-powered persistent monitoring agent for EVM wallets. Tutela watches registered wallets for risky token approvals, drainer contracts, and anomalous transaction patterns in real time, then alerts the user and prepares a revocation transaction for them to review and sign.

**Live**: [tutela-guard.vercel.app](https://tutela-guard.vercel.app) · API: [tutela-lr4g.onrender.com](https://tutela-lr4g.onrender.com)

---

## Why this project

Most wallet-security tools are either:
1. Pre-signature scanners (check a transaction right before you sign it), or
2. Static approval-checker dashboards you have to remember to check manually.

Tutela is neither — it's a **persistent agent** that watches wallets continuously, reasons about risk the way a human security analyst would, and prepares an action (alert + revoke transaction) without the user needing to actively monitor anything. This requires live chain monitoring infrastructure, a decision engine that can handle ambiguous/novel threats, and a safe action-preparation model that never takes custody of funds.

---

## How sign-in works

Tutela has no passwords, no email addresses, and no accounts to leak. You connect a wallet and sign a short, one-time challenge message — the backend verifies the signature, issues a JWT, and that's the whole account. Nothing but a public wallet address and (optionally) a linked Telegram chat ID is ever stored for you. Sign-in works from a browser extension, a wallet app's built-in browser, or — via WalletConnect — any regular mobile browser.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | Node.js + Express + TypeScript | REST API, no framework magic |
| ORM / DB | Prisma + PostgreSQL | `User`, `Wallet`, `Scan`, `Approval`, `Alert` |
| Chain data | Alchemy Custom Webhooks (GraphQL) | Signature-verified (HMAC-SHA256) `Approval` event delivery |
| Decision engine | Deterministic rules + Claude (Anthropic API) | Rules catch known drainers/unlimited approvals instantly; the LLM only runs on genuinely ambiguous cases, gated to paid plans |
| Alerts | Telegraf (Telegram bot) | One-time link code flow from Settings, gated to paid plans |
| Auth | Wallet signature (SIWE-style challenge) + JWT + permission-based RBAC | No passwords, no email, no bcrypt |
| Frontend | Next.js (App Router) + TypeScript + Tailwind v4 | Dashboard, wallets, risk feed, approvals, alerts, settings |
| Wallet connection | wagmi + viem + WalletConnect (Reown) | Injected connector (extensions/in-app browsers) with a WalletConnect fallback for any browser |
| Hosting | Render (API, free tier) + Vercel (frontend) | Both auto-deploy from `main` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│               Frontend (Next.js App Router)               │
│  Dashboard · Wallets · Risk feed · Approvals · Alerts      │
└───────────────────────────┬───────────────────────────────┘
                             │ REST (JWT bearer)
┌───────────────────────────▼───────────────────────────────┐
│                    Platform Layer (Express)                │
│   Wallet-signature auth · Permission-based RBAC ·           │
│   Wallet registration · Plan gating                         │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                     Monitoring Service                     │
│   Alchemy Custom Webhook (signature-verified)               │
│   → normalizes approval events → Decision Engine             │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                      Decision Engine                        │
│   1. Rules layer: unlimited-approval detection, known-       │
│      drainer/spender checks                                  │
│   2. LLM reasoning layer (paid plans): ambiguous cases        │
│      the rules layer can't resolve on its own                │
│   → risk score + verdict, persisted to Scan                  │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                       Action Layer                          │
│   Telegram alert (paid plans) · Prepared revoke tx           │
│   (unsigned approve(spender, 0), user signs and broadcasts)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```prisma
model User {
  id                        String    @id @default(cuid())
  walletAddress             String    @unique
  role                      String    @default("user")
  plan                      String    @default("free")
  permissions               String[]  @default([])
  telegramChatId            String?
  telegramLinkCode          String?
  telegramLinkCodeExpiresAt DateTime?
  wallets                   Wallet[]
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
}

model Wallet {
  id        String     @id @default(cuid())
  address   String
  chain     String
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  scans     Scan[]
  alerts    Alert[]
  approvals Approval[]
  createdAt DateTime   @default(now())

  @@unique([address, chain, userId])
}

model Scan {
  id        String   @id @default(cuid())
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  txHash    String?
  riskScore Int
  verdict   String   // "safe", "suspicious", "malicious"
  reasoning String?
  createdAt DateTime @default(now())
}

model Approval {
  id           String   @id @default(cuid())
  walletId     String
  wallet       Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  spender      String
  tokenAddress String
  amount       String
  status       String   @default("active") // "active", "revoked"
  revokeTxHash String?
  detectedAt   DateTime @default(now())
}

model Alert {
  id        String   @id @default(cuid())
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)
  type      String   // "risky_approval", "drainer_contract", etc.
  message   String
  sent      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Plans

| Plan | Wallets | LLM reasoning on ambiguous cases | Telegram alerts |
|---|---|---|---|
| Free | 3 | — | — |
| Sentinel / Command | Unlimited | ✅ | ✅ |

Both gates are enforced server-side, not just hidden in the UI.

---

## Repo Structure

```
tutela/
├── apps/
│   ├── api/                     # Express + TypeScript backend
│   │   ├── src/
│   │   │   ├── auth/            # Wallet-challenge auth, JWT middleware, RBAC
│   │   │   ├── wallets/         # Wallet registration CRUD
│   │   │   ├── monitoring/      # Alchemy webhook receiver
│   │   │   ├── decision-engine/ # rules.ts + llmReasoning.ts
│   │   │   ├── actions/         # alerts.ts, revoke.ts, telegramBot.ts
│   │   │   ├── dashboard/       # Scans/approvals/alerts read endpoints
│   │   │   └── db/              # Prisma client singleton
│   │   └── prisma/schema.prisma
│   └── web/                     # Next.js App Router frontend
│       └── src/
│           ├── app/             # dashboard, wallets, risk-feed, approvals,
│           │                    # alerts, settings, login, register, terms, privacy
│           ├── components/
│           └── lib/             # typed API client, wagmi config
├── docker-compose.yml           # local Postgres for dev
└── README.md
```

See `IMPLEMENTATION.md` for local setup and `INTEGRATION.md` for external service configuration.
