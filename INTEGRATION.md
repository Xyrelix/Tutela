# Tutela — Integration Guide

External services, accounts, and credentials needed to connect Tutela to real chain data, AI reasoning, alerting, and (optionally) production infrastructure. Pair with `IMPLEMENTATION.md` for where each credential is consumed in code.

---

## 1. Chain Monitoring Provider (required)

You need a provider that can push pending-transaction and approval-event data for EVM chains. Recommended: **Alchemy**, since it gives the fastest path given prior RPC experience.

### Setup
1. Create an account at Alchemy and create an app scoped to your target chain(s) (Ethereum mainnet + Base recommended for v1 — pick 1-2 chains, don't try to cover all EVM chains at once)
2. Grab the **API key** → `ALCHEMY_API_KEY`
3. Set up an **Alchemy Notify webhook**:
   - Type: "Address Activity" webhook, scoped to the registered wallet addresses (you'll need to update the webhook's address list dynamically as users register wallets — Alchemy's API supports adding/removing addresses from an existing webhook)
   - Also consider a **Custom Webhook (GraphQL)** for approval-event-specific monitoring (watching `Approval` events on ERC-20 contracts) if Address Activity alone isn't granular enough
4. Copy the **webhook signing key** → `ALCHEMY_WEBHOOK_SIGNING_KEY` (used to verify incoming webhook payloads are genuinely from Alchemy — do not skip this, it's how you prevent spoofed alerts)
5. Your `apps/api/src/monitoring/` receiver needs a public HTTPS endpoint to receive webhooks — during local dev use a tunnel (ngrok, cloudflared) since Alchemy can't reach `localhost`

```bash
ngrok http 4000
# use the generated https URL as your webhook target in Alchemy's dashboard
```

**Alternative**: Blocknative (better raw mempool visibility, more expensive) if Alchemy's webhook latency isn't sufficient once you're testing against live drainer patterns.

---

## 2. LLM Reasoning Layer (required)

The decision engine's ambiguous-case reasoning uses the Anthropic API (same one you're talking to now).

### Setup
1. Get an API key from the Anthropic Console → `ANTHROPIC_API_KEY`
2. Cost control is important here since this runs continuously: only invoke the LLM when the rules layer flags a case as ambiguous, never on every single event. Budget and rate-limit this call path specifically.
3. Suggested model: a fast/cheap model (e.g. Haiku-tier) for the reasoning layer, since this is a real-time classification task, not open-ended generation — reserve larger models only if you need deeper reasoning on genuinely novel contract patterns.

---

## 3. Telegram Alerts (required for v1 alerting)

Reuses the same integration pattern as Aegis.

### Setup
1. Message `@BotFather` on Telegram → `/newbot` → follow prompts → copy the bot token → `TELEGRAM_BOT_TOKEN`
2. Users need to start a chat with your bot and you'll need to capture their `chat_id` (store it on the `User` model, e.g. `telegramChatId`) — simplest approach: bot replies to `/start` with instructions to link their account via a one-time code shown in the dashboard
3. Test with a simple `bot.telegram.sendMessage(chatId, "test")` before wiring into the alert action

---

## 4. Email Alerts (required for v1 alerting)

Same nodemailer setup as BizIQ's trial reminder emails.

### Setup
1. Pick a provider: SMTP via your own domain, or a transactional service (SendGrid, Resend, Mailgun)
2. Collect: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
3. For local dev/testing without spamming real inboxes, use Mailtrap or Ethereal (nodemailer has built-in Ethereal test account support — `nodemailer.createTestAccount()`)

---

## 5. Auto-Revoke Path (decide before Phase 3)

This is the biggest integration decision in the whole project — resolve it before building the actions layer.

### Option A — Prepared revoke, user signs (v1 default, no extra integration needed)
- No additional service required
- Backend uses `ethers.js` to encode an `approve(spender, 0)` call against the token contract ABI and returns the unsigned transaction to the frontend
- Frontend prompts the connected wallet (MetaMask/WalletConnect) to sign and broadcast it
- **Frontend needs**: a wallet-connection library — install `wagmi` + `viem` (modern standard) or `ethers` + a WalletConnect provider

```bash
cd apps/web
npm install wagmi viem @tanstack/react-query
```

You'll need a **WalletConnect Project ID** (free, from WalletConnect Cloud) if supporting WalletConnect-based wallets, not just injected browser wallets.

### Option B — True autonomous revoke (v2 stretch, needs account abstraction)
- Requires users to deploy or use a **Safe** (Gnosis Safe) smart account, or an ERC-4337 smart account with session keys
- Integration needed:
  - **Safe**: `@safe-global/protocol-kit` and `@safe-global/api-kit` npm packages; users must first create a Safe (one-time setup flow you'd need to build) and grant Tutela's signer address a scoped session key/module permission limited to `approve(_, 0)` calls only — never broader permissions
  - **ERC-4337**: a bundler + paymaster service (e.g. Alchemy Account Kit, which conveniently pairs with the monitoring provider above, or Biconomy/ZeroDev) plus a session-key module contract
- This path adds real security-engineering surface area (a compromised or buggy session key is itself an attack vector), so only pursue it once v1 is stable and you have time to threat-model it properly — flag this explicitly in your SIWES report as a "designed for but scoped out of v1 for safety" decision if you don't finish it; that's a legitimate and honest engineering call, not a gap.

---

## 6. Production Infrastructure (when moving beyond local dev)

Mirrors your BizIQ stack.

| Service | Purpose | Notes |
|---|---|---|
| Neon (Postgres) | Production DB | Watch for autosuspend causing Prisma `57P01` errors, as seen on BizIQ — same fix (keep-alive ping or a higher-tier plan) |
| Upstash (Redis) | Job queues, rate limiting, session cache | Apply the same `keepAlive` + heartbeat fix used on BizIQ for idle connection drops |
| Render | Hosting (API + worker) | Deploy via Docker, same as BizIQ |
| Cloudflare | DNS / edge | If using a custom domain for the dashboard |
| Vercel | Frontend hosting | Native Next.js support — connect the repo, set `NEXT_PUBLIC_API_URL`, zero extra config |

---

## 7. Environment Variable Checklist

Copy this into your deployment platform's secret manager once every service above is set up:

```
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_EXPIRES_IN
ALCHEMY_API_KEY
ALCHEMY_WEBHOOK_SIGNING_KEY
ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
WALLETCONNECT_PROJECT_ID   # only if supporting WalletConnect
PORT
NODE_ENV
NEXT_PUBLIC_API_URL   # apps/web — deployed API URL
```

---

## 8. Integration Order (recommended)

Don't set all of this up on day one — bring services online as each phase needs them:

1. **Phase 1**: none of the above needed yet — pure local Postgres/Redis via Docker
2. **Phase 2**: Alchemy (§1) + Anthropic (§2) — this is when monitoring/detection goes live
3. **Phase 3**: Telegram (§3) + Email (§4) + wallet-connection library (§5 Option A)
4. **Phase 4-5**: production infra (§6) only once you're ready to deploy a demo-able instance
