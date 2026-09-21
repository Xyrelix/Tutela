# Tutela — Implementation Guide

Everything needed to run the project locally. Pair with `README.md` (architecture/overview) and `INTEGRATION.md` (external services/credentials).

---

## 0. Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (for local Postgres)
- Git

```bash
node -v   # confirm >= 20
docker -v
```

---

## 1. Clone and install

```bash
git clone https://github.com/Xyrelix/Tutela.git
cd Tutela
cd apps/api && npm install
cd ../web && npm install
```

---

## 2. Local Infrastructure (Docker Compose)

`docker-compose.yml` at the repo root provisions local Postgres:

```bash
docker compose up -d
```

> The compose file also defines a Redis container, but nothing in the app currently reads from
> or writes to Redis — the auth challenge store is a plain in-memory `Map` (see `auth/routes.ts`).
> You can skip starting the `redis` service unless you're adding something that needs it.

---

## 3. Backend (`apps/api`) Setup

### 3.1 Prisma

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

The schema lives at `apps/api/prisma/schema.prisma` (also documented in `README.md`).

### 3.2 Environment variables

Copy `apps/api/.env.example` to `apps/api/.env` and fill in real values — see `INTEGRATION.md` for
where each one comes from.

### 3.3 package.json scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  }
}
```

> `bcrypt`, `ioredis`, `nodemailer`, and `node-cron` are present in `package.json` but currently
> unused in `src/` — leftover from an earlier plan (password auth, Redis-backed state, email
> alerts, cron polling) that was superseded by wallet-signature auth, an in-memory challenge
> store, Telegram-only alerts, and webhook-driven event processing. Safe to remove if you're not
> planning to build one of those back in.

---

## 4. Frontend (`apps/web`) Setup

Routing is Next.js's file-based App Router (`src/app/*/page.tsx`). Tailwind v4 is wired in via
`@tailwindcss/postcss` — there's no separate `tailwind.config.js`.

Create `apps/web/.env.local` (never commit — see `.gitignore`), copying from `.env.local.example`:

```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="" # from dashboard.reown.com — see INTEGRATION.md
```

Dev server:
```bash
npm run dev
```
Runs on `http://localhost:3000` by default.

---

## 5. Environment Variables

`apps/api/.env`:

```
# Database
DATABASE_URL="postgresql://sable:sable@localhost:5432/sable_warden?schema=public"

# Auth
JWT_SECRET="replace-with-strong-random-value"
JWT_EXPIRES_IN="7d"

# Chain monitoring provider (see INTEGRATION.md)
ALCHEMY_API_KEY=""
ALCHEMY_WEBHOOK_SIGNING_KEY=""

# LLM reasoning layer (see INTEGRATION.md)
ANTHROPIC_API_KEY=""

# Telegram alerts (see INTEGRATION.md)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_BOT_USERNAME=""

# Comma-separated list of origins allowed to call this API from a browser.
# Defaults to http://localhost:3000,https://tutela-guard.vercel.app if unset.
CORS_ORIGIN=""

# App
PORT=4000
NODE_ENV=development
```

`apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
```

`apps/api/.env.example` and `apps/web/.env.local.example` mirror these with empty values and are
the only env-related files committed to the repo.

---

## 6. Where Things Live

| Concern | Path |
|---|---|
| Wallet-signature auth, JWT, RBAC | `apps/api/src/auth/` |
| Wallet registration CRUD | `apps/api/src/wallets/` |
| Alchemy webhook receiver | `apps/api/src/monitoring/webhook.ts` |
| Deterministic risk rules | `apps/api/src/decision-engine/rules.ts` |
| LLM reasoning (ambiguous cases only) | `apps/api/src/decision-engine/llmReasoning.ts` |
| Telegram bot + alert dispatch | `apps/api/src/actions/telegramBot.ts`, `alerts.ts` |
| Prepared-revoke transaction builder | `apps/api/src/actions/revoke.ts` |
| Scans/approvals/alerts read endpoints | `apps/api/src/dashboard/routes.ts` |
| Plan gating (`isPro`, wallet limit) | `apps/api/src/lib/plans.ts` |
| Dashboard/wallets/risk-feed/approvals/alerts/settings pages | `apps/web/src/app/` |
| Typed API client + wagmi config | `apps/web/src/lib/` |

---

## 7. Running Everything Locally

```bash
# Terminal 1 — infra
docker compose up -d postgres

# Terminal 2 — backend
cd apps/api && npm run dev

# Terminal 3 — frontend
cd apps/web && npm run dev
```

Backend on `http://localhost:4000`, frontend on `http://localhost:3000`.

The Alchemy webhook can't reach `localhost` — use a tunnel (ngrok, cloudflared) if you need to test
live on-chain events against your local backend. See `INTEGRATION.md` §1.

---

## 8. Testing

```bash
cd apps/api
npm test
```

Jest + `ts-jest` covers the decision engine's rules layer and plan-gating logic — the two places
where a silent bug would be hardest to notice and most consequential.

---

## 9. Deployment

Backend: Docker build → Render. `apps/api/Dockerfile`:

```dockerfile
FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

Notes on why it's built this way:
- `npm ci` (not `--omit=dev`) — `prisma generate` and `npm run build` (`tsc`) both need
  dev-only packages (`prisma`, `typescript`). Skipping dev deps here breaks the build.
- The `apt-get install openssl` line is required — without it, Prisma's engine can't detect the
  right libssl on `node:20-slim` and silently falls back to a guess, which errors at *runtime*,
  not build time.
- The container's `CMD` runs `prisma migrate deploy` on every boot, so schema changes ship
  automatically with each deploy — no separate manual migration step.
- Render sets `PORT` itself; `src/index.ts` already reads `process.env.PORT` so no config needed
  there.

On Render: set the service's Root Directory to `apps/api`, instance type to the free tier, and
set the env vars from §5. Free tier accepts a real tradeoff: the service spins down after ~15 min
idle and cold-starts on the next request, which also pauses the Telegram bot's long-polling loop
while asleep — alerts queue up and deliver on the next wake rather than instantly. A background
"Worker" service type is *not* a fit here — it has no public URL, so it can't receive Alchemy's
webhook POSTs or serve the frontend's API calls at all.

Frontend: deploy `apps/web` directly to Vercel (zero-config native Next.js support — connect the
repo in the dashboard). Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` there.

Full external-service setup (Alchemy, Anthropic, Telegram, Reown/WalletConnect) is in
`INTEGRATION.md`.
