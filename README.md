# Tutela

An AI-powered persistent monitoring agent for EVM wallets. Tutela watches registered wallets for risky token approvals, drainer contracts, and anomalous transaction patterns in real time, then alerts the user and can prepare (or, later, autonomously execute) revocation actions to protect funds.

Built as a personal capstone project combining:
- **Sentinel**-style pre-signature risk scoring and contract analysis
- **Aegis**-style persistent agent architecture (rules engine + LLM reasoning, decision engine, action layer)
- **BizIQ**-style multi-tenant SaaS backend (auth, RBAC, billing-ready structure)

---

## Why this project

Most wallet-security tools are either:
1. Pre-signature scanners (check a transaction right before you sign it), or
2. Static approval-checker dashboards you have to remember to check manually.

Tutela is neither — it's a **persistent agent** that watches wallets continuously, reasons about risk the way a human security analyst would, and can act (alert or revoke) without the user needing to actively monitor anything. This is a meaningfully harder problem than a pre-signature scanner because it requires live chain monitoring infrastructure, a decision engine that can handle ambiguous/novel threats, and a safe action-execution model.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | Node.js + Express | Reuse proven BizIQ patterns |
| ORM / DB | Prisma + PostgreSQL | Same as BizIQ backend |
| Cache / Queue | Redis (Upstash) | For job queues, rate limiting, session state |
| Chain data | Alchemy (Notify + mempool) or Blocknative | Mempool + approval event streaming |
| Agent framework | Custom decision engine (rules + LLM), modeled on Aegis's `decision.js` pattern | Deterministic checks first, LLM for ambiguous cases |
| Alerts | Telegraf (Telegram bot) + email (nodemailer) | Reuse Aegis/BizIQ integrations |
| Auth | JWT + RBAC (permission-based, not just role-based) | Same pattern as BizIQ's `onboarding:override` permission model |
| Frontend | React + TypeScript + Tailwind | Dashboard: wallets, risk feed, approvals, alerts |
| Account abstraction (stretch) | Safe (Gnosis Safe) / ERC-4337 session keys | Needed for true autonomous revoke without a live user signature |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│   Wallet list · Risk feed · Approval manager · Alerts    │
└───────────────────────────┬───────────────────────────────┘
                             │ REST/WebSocket
┌───────────────────────────▼───────────────────────────────┐
│                    Platform Layer (Express)                │
│   Auth · RBAC · Tenants/Users · Wallet registration ·       │
│   Billing tier stub                                         │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                     Monitoring Service                     │
│   Mempool/approval event listener (Alchemy/Blocknative)     │
│   → normalizes events → pushes to Decision Engine queue     │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                      Decision Engine                        │
│   1. Rules layer: known-drainer lists, unlimited-approval    │
│      detection, contract verification status                │
│   2. LLM reasoning layer: ambiguous/novel contracts,          │
│      unusual calldata patterns                                │
│   → risk score + recommended action                           │
└───────────────────────────┬───────────────────────────────┘
                             │
┌───────────────────────────▼───────────────────────────────┐
│                       Action Layer                          │
│   Alert (Telegram/email) · Prepare revoke tx (v1) ·          │
│   Auto-revoke via session key (stretch, v2)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Build Phases

### Phase 1 — Foundation (Week 1)
- [ ] Multi-tenant platform skeleton (reuse BizIQ patterns): auth, users, RBAC
- [ ] Wallet registration (one user → many wallets)
- [ ] DB schema: users, wallets, scan history, alert log, revocation actions
- [ ] Base Express app structure, env config, Docker setup

### Phase 2 — Detection Engine (Weeks 2–3)
- [ ] Port Sentinel's pre-signature risk scoring (contract risk, known-drainer patterns)
- [ ] Live monitoring: mempool/approval event streaming (Alchemy Notify or Blocknative)
- [ ] Rules layer: known malicious contracts, unlimited-approval detection
- [ ] LLM reasoning layer: ambiguous/novel contract analysis
- [ ] Risk scoring + persistence to scan history

### Phase 3 — Agent Actions (Weeks 3–4)
- [ ] Telegram + email alerting on detected risk
- [ ] Prepared-revoke flow (agent builds tx, user signs — v1 default)
- [ ] Decide on account-abstraction path for true auto-revoke (Safe / ERC-4337 session keys)
- [ ] (Stretch) Autonomous revoke execution within pre-authorized limits

### Phase 4 — Dashboard & Polish (Weeks 4–5)
- [ ] Wallet list + live risk feed UI
- [ ] Approval management view (all active approvals, one-click revoke)
- [ ] Alert history view
- [ ] Billing tier stub (free vs. pro monitoring frequency)

### Phase 5 — Demo Prep (Week 5+)
- [ ] Seed with real historical drainer contract addresses for demo
- [ ] Write up technical rationale (why persistent monitoring > pre-signature-only)
- [ ] Record demo walkthrough

---

## Database Schema (initial draft)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          String   @default("user")
  wallets       Wallet[]
  createdAt     DateTime @default(now())
}

model Wallet {
  id            String   @id @default(cuid())
  address       String
  chain         String   // "ethereum", "base", etc.
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  scans         Scan[]
  alerts        Alert[]
  approvals     Approval[]
  createdAt     DateTime @default(now())
}

model Scan {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id])
  txHash        String?
  riskScore     Int
  verdict       String   // "safe", "suspicious", "malicious"
  reasoning     String?  // LLM explanation
  createdAt     DateTime @default(now())
}

model Approval {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id])
  spender       String
  tokenAddress  String
  amount        String   // stored as string, could be "unlimited"
  status        String   @default("active") // "active", "revoked"
  detectedAt    DateTime @default(now())
}

model Alert {
  id            String   @id @default(cuid())
  walletId      String
  wallet        Wallet   @relation(fields: [walletId], references: [id])
  type          String   // "risky_approval", "drainer_contract", etc.
  message       String
  sent          Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

---

## Open Decisions (resolve before/during Phase 1–3)

1. **Mempool/monitoring provider**: Alchemy Notify vs. Blocknative vs. self-run node. Alchemy is likely fastest to integrate given existing familiarity with provider-based RPC work.
2. **Auto-revoke model**: 
   - v1 (recommended start): agent detects risk → prepares revoke transaction → user signs manually. Works with any EOA wallet, no extra infra.
   - v2 (stretch): true autonomous revoke requires the user to use a Safe or ERC-4337 smart account with a pre-authorized session key scoped to "revoke only" actions. Bigger lift, but is the differentiating feature if time allows.
3. **LLM provider/cost model**: which model handles the reasoning layer, and how to keep inference costs bounded for continuous monitoring (e.g., only invoke the LLM when rules layer flags something as ambiguous, not on every event).

---

## Repo Structure (proposed)

```
tutela/
├── apps/
│   ├── api/                # Express backend (platform + monitoring + decision engine)
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── wallets/
│   │   │   ├── monitoring/
│   │   │   ├── decision-engine/
│   │   │   │   ├── rules.js
│   │   │   │   └── llmReasoning.js
│   │   │   ├── actions/
│   │   │   │   ├── alerts.js
│   │   │   │   └── revoke.js
│   │   │   └── db/
│   │   │       └── schema.prisma
│   │   └── package.json
│   └── web/                 # React + TypeScript dashboard
│       ├── src/
│       └── package.json
├── docker-compose.yml
└── README.md
```
