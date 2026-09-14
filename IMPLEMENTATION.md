# Tutela — Implementation Guide

Everything needed to scaffold, install, and run the project locally, phase by phase. Pair with `README.md` (architecture/overview) and `INTEGRATION.md` (external services/credentials).

---

## 0. Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (for local Postgres + Redis)
- Git

```bash
node -v   # confirm >= 20
docker -v
```

---

## 1. Repo Scaffolding

```bash
mkdir tutela && cd tutela
git init
mkdir -p apps/api/src/{auth,wallets,monitoring,decision-engine,actions,db}
mkdir -p apps/web/src
touch README.md IMPLEMENTATION.md INTEGRATION.md docker-compose.yml .gitignore
```

**.gitignore** (root):
```
node_modules/
dist/
.env
.env.*
!.env.example
*.log
.DS_Store
```

---

## 2. Local Infrastructure (Docker Compose)

`docker-compose.yml`:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: sable
      POSTGRES_PASSWORD: sable
      POSTGRES_DB: sable_warden
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: unless-stopped
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

```bash
docker compose up -d
```

> Note: this is for **local dev**. Per your BizIQ setup, production will likely move to Neon (Postgres) and Upstash (Redis) — see `INTEGRATION.md`.

---

## 3. Backend (`apps/api`) Setup

```bash
cd apps/api
npm init -y
```

### 3.1 Core dependencies

```bash
npm install express cors helmet dotenv
npm install @prisma/client
npm install jsonwebtoken bcrypt
npm install ioredis
npm install ethers
npm install telegraf
npm install nodemailer
npm install node-cron
npm install axios
npm install zod
```

### 3.2 Dev dependencies

```bash
npm install -D prisma
npm install -D typescript ts-node ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/cors
npm install -D nodemon
npm install -D eslint prettier eslint-config-prettier
npm install -D jest ts-jest @types/jest supertest @types/supertest
```

### 3.3 TypeScript config

```bash
npx tsc --init
```

`tsconfig.json` key settings:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

### 3.4 Prisma init

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and `.env`. Set:

```
DATABASE_URL="postgresql://sable:sable@localhost:5432/sable_warden?schema=public"
```

Paste in the schema from `README.md` (`User`, `Wallet`, `Scan`, `Approval`, `Alert` models), then:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 3.5 package.json scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:studio": "prisma studio",
    "prisma:migrate": "prisma migrate dev",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## 4. Frontend (`apps/web`) Setup

```bash
cd ../web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install axios lucide-react recharts wagmi viem @tanstack/react-query
```

Routing is Next.js's file-based App Router (`src/app/*/page.tsx`) — no `react-router-dom` needed.
Tailwind v4 is wired in via `@tailwindcss/postcss`; no separate `tailwind.config.js` to edit.

Create `apps/web/.env.local` (never commit — see `.gitignore`):
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Dev server:
```bash
npm run dev
```
Runs on `http://localhost:3000` by default.

---

## 5. Environment Variables

Create `apps/api/.env` (never commit — see `.gitignore`):

```
# Database
DATABASE_URL="postgresql://sable:sable@localhost:5432/sable_warden?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

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

# Email alerts (see INTEGRATION.md)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# App
PORT=4000
NODE_ENV=development
```

Also create `apps/api/.env.example` with the same keys but empty/placeholder values, and commit that one.

---

## 6. Build Order (map to README phases)

### Phase 1 — Foundation
1. `apps/api/src/auth/` — register/login routes, JWT middleware, RBAC permission check middleware (reuse BizIQ's permission-based pattern, not role-based)
2. `apps/api/src/wallets/` — CRUD routes for registering/removing wallet addresses per user
3. `apps/api/src/db/` — Prisma client singleton (`db/client.ts`)
4. `apps/api/src/index.ts` — Express app bootstrap, mount routers, error handler middleware

### Phase 2 — Detection Engine
1. `apps/api/src/monitoring/` — Alchemy webhook receiver (or polling worker) that listens for approval events / pending txs on registered wallets
2. `apps/api/src/decision-engine/rules.ts` — deterministic checks: known-drainer contract list (seed from a static JSON list you maintain), unlimited-approval detection (`amount === MaxUint256`), unverified-contract flag
3. `apps/api/src/decision-engine/llmReasoning.ts` — calls Anthropic API only when rules layer returns "ambiguous"; sends contract address, calldata summary, verification status; expects a structured risk verdict back
4. Wire results into `Scan` table via Prisma

### Phase 3 — Agent Actions
1. `apps/api/src/actions/alerts.ts` — Telegraf bot integration + nodemailer, triggered on risk detection
2. `apps/api/src/actions/revoke.ts` — v1: builds an unsigned `approve(spender, 0)` transaction and returns it to the frontend for the user to sign and broadcast (via ethers.js `Contract` interface encoding, no private key handling server-side)
3. Decide + document account-abstraction path if pursuing v2 auto-revoke (see `INTEGRATION.md` §5)

### Phase 4 — Dashboard
1. Wallet list page, risk feed page, approval manager page, alert history page in `apps/web/src`
2. Typed API client (`apps/web/src/api/`) mirroring backend Zod schemas, same pattern as BizIQ's `businessApi.ts`
3. Billing tier stub — simple `plan: "free" | "pro"` field on `User`, gate monitoring poll frequency in the worker

### Phase 5 — Demo Prep
1. Seed script (`prisma/seed.ts`) with known historical drainer contract addresses for demo scans
2. `npx prisma db seed`

---

## 7. Running Everything Locally

```bash
# Terminal 1 — infra
docker compose up -d

# Terminal 2 — backend
cd apps/api && npm run dev

# Terminal 3 — frontend
cd apps/web && npm run dev
```

Backend on `http://localhost:4000`, frontend on `http://localhost:3000` (Next.js default).

---

## 8. Testing

```bash
cd apps/api
npm test
```

Use `supertest` for route tests, `ts-jest` for unit tests on the decision engine's rules layer (this is the highest-value thing to unit test — deterministic risk rules should have full branch coverage before you trust the agent's output).

---

## 9. Deployment (when ready)

Backend: Docker build → Render, **free web service tier** (this project doesn't need to scale yet,
so the free tier's spin-down-after-idle behavior is an accepted tradeoff — see `INTEGRATION.md`
§6 for what that means for the Telegram bot's polling loop). `apps/api/Dockerfile`:

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

Notes on why it's built this way (verified locally with `docker build` + `docker run` against the
local Postgres/Redis containers before ever touching Render):
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
paste in the full env var checklist from `INTEGRATION.md` §7 (`DATABASE_URL` pointing at Neon,
`REDIS_URL` at Upstash — not Render's own free Postgres, which expires after a fixed period).

Frontend: deploy `apps/web` directly to Vercel (zero-config native Next.js support — `vercel --prod` or connect the repo in the dashboard). Set `NEXT_PUBLIC_API_URL` there to the deployed API's URL.

Full external-service setup (Alchemy, Anthropic, Telegram, SMTP, Neon, Upstash) is in `INTEGRATION.md`.
