# Tutela — Integration Guide

External services, accounts, and credentials needed to connect Tutela to real chain data, AI reasoning, and alerting. Pair with `IMPLEMENTATION.md` for where each credential is consumed in code.

---

## 1. Chain Monitoring Provider (required)

Tutela uses **Alchemy Custom Webhooks (GraphQL)** to receive `Approval` events on registered wallets.

### Setup
1. Create an account at Alchemy and create an app scoped to your target chain(s) — this project
   targets Ethereum and Base.
2. Grab the **API key** → `ALCHEMY_API_KEY`.
3. Create a **Custom Webhook (GraphQL)** matching the query in `monitoring/webhook.ts`'s header
   comment — filtering on `Approval` event logs, not a generic "Address Activity" webhook (Address
   Activity only fires when value actually moves, so it can't deliver approval events, which don't
   move any funds themselves).
4. Copy the **webhook signing key** → `ALCHEMY_WEBHOOK_SIGNING_KEY`. This is required — the
   webhook receiver verifies every incoming payload with an HMAC-SHA256 signature
   (`monitoring/webhook.ts`'s `verifySignature`) and rejects anything that doesn't match, so a
   missing or wrong key means requests get rejected, not silently trusted.
5. The receiver needs a public HTTPS endpoint — Alchemy can't reach `localhost`. Use a tunnel
   (ngrok, cloudflared) for local testing.

```bash
ngrok http 4000
# use the generated https URL as your webhook target in Alchemy's dashboard
```

Point the webhook at whichever network you're actually testing against (mainnet vs. Sepolia) —
mismatching the app's configured chain with the webhook's chain is a common setup mistake.

---

## 2. LLM Reasoning Layer (required for Sentinel/Command-tier accuracy)

The decision engine's ambiguous-case reasoning uses the Anthropic API.

### Setup
1. Get an API key from the Anthropic Console → `ANTHROPIC_API_KEY`.
2. This only runs when the rules layer flags a case as `ambiguous` — never on every event — so cost
   stays bounded regardless of monitoring volume (see `decision-engine/rules.ts` and
   `monitoring/webhook.ts`).
3. On the free plan, ambiguous cases are marked `suspicious` by default instead of invoking the
   LLM (`isPro` check in `monitoring/webhook.ts`) — the LLM reasoning layer is a paid-plan feature.

---

## 3. Telegram Alerts (Sentinel/Command plans only)

### Setup
1. Message `@BotFather` on Telegram → `/newbot` → follow prompts → copy the bot token →
   `TELEGRAM_BOT_TOKEN`, and the bot's username → `TELEGRAM_BOT_USERNAME`.
2. Users link Telegram from the Settings page: it generates a short-lived code
   (`POST /api/actions/telegram/link-code`), the user sends `/start <code>` to the bot, and the bot
   stores their `chat_id` on the `User` model (`telegramChatId`).
3. This is gated server-side to paid plans — `POST /api/actions/telegram/link-code` returns 403 for
   free-plan users, and `dispatchAlert` won't send to a linked chat if the user's plan has since
   lapsed back to free (see `actions/routes.ts` and `actions/alerts.ts`).

> Email alerts were part of the original design (`SMTP_*` env vars, `nodemailer`) but were never
> actually wired up — `dispatchAlert` in `actions/alerts.ts` only has a Telegram delivery path
> today. Treat any `SMTP_*` references elsewhere as unimplemented, not a working feature.

---

## 4. Wallet Connection (required)

Frontend wallet connection is `wagmi` + `viem`, with two connectors:

- **Injected** — browser extensions (MetaMask, Rabby, Brave Wallet, etc.) and wallet apps' own
  built-in browsers. No setup needed.
- **WalletConnect** — QR code (desktop) or a deep link into an installed wallet app (mobile), for
  anyone without an injected provider. Requires a **Project ID**:
  1. Go to `dashboard.reown.com` (WalletConnect's dashboard, now under the Reown brand — not the
     old `cloud.walletconnect.com` domain) and create an account + project.
  2. Copy the **Project ID** → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
  3. If this is unset, `apps/web/src/lib/wagmi.ts` skips adding the WalletConnect connector
     entirely — injected-only still works, but there's no fallback for browsers without an
     injected provider.

Auto-detection prefers whatever's injected, since some browsers (Brave) ship a built-in wallet
that's always present even if unused — `authenticateWallet()` accepts an explicit
`preferredConnectorId` override, which is what powers the "Use a different wallet with QR code"
link on `/login` and `/register`.

Revocation itself needs no separate integration: the backend uses `ethers.js` to encode an
`approve(spender, 0)` call (`actions/revoke.ts`) and returns the unsigned transaction for the
connected wallet to sign and broadcast. Tutela never holds a key that could do this on its own.

---

## 5. Production Infrastructure

| Service | Purpose | Notes |
|---|---|---|
| Postgres | Production DB | Wherever you host it (Render's own Postgres, Neon, etc.) — set `DATABASE_URL` accordingly. |
| Render | API hosting | Deploy via Docker, free tier — accepted tradeoff: the service spins down after ~15 min idle and cold-starts on the next request. This also pauses the Telegram bot's long-polling loop while asleep (`actions/telegramBot.ts`'s `bot.launch()`), so alerts queue up and deliver on the next wake rather than instantly. A background "Worker" service type is *not* a fit here — it has no public URL, so it can't receive Alchemy's webhook POSTs or serve the frontend's API calls at all. |
| Vercel | Frontend hosting | Native Next.js support — connect the repo, set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, zero extra config. |
| Cloudflare | DNS / edge | Only relevant if using a custom domain for the dashboard. |

`CORS_ORIGIN` on the API defaults to `http://localhost:3000,https://tutela-guard.vercel.app` if
unset — add any additional frontend origin (custom domain, preview deployments) as a comma-separated
list, or browser requests from that origin will be rejected.

---

## 6. Environment Variable Checklist

`apps/api`:
```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
ALCHEMY_API_KEY
ALCHEMY_WEBHOOK_SIGNING_KEY
ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_USERNAME
CORS_ORIGIN          # optional — has safe defaults, see §5
PORT
NODE_ENV
```

`apps/web`:
```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

---

## 7. Setup Order

Don't set all of this up on day one:

1. **Local dev, no external services**: Postgres via Docker Compose is enough to run auth, wallet
   registration, and the dashboard against seeded/manually-created data.
2. **Live monitoring**: Alchemy (§1) + Anthropic (§2) — this is when the decision engine actually
   evaluates real on-chain events instead of just serving whatever's already in the DB.
3. **Alerting + wallet connection**: Telegram (§3) + WalletConnect (§4).
4. **Deploying a live instance**: production infra (§5).
