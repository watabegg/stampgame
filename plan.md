# stampgame Monorepo — AI Agent Runbook & Detailed Spec

This document is written so an AI agent can execute end‑to‑end setup and implementation via GitHub + Cloudflare + Vercel. It is **idempotent**, lists **prerequisites**, **secrets**, **commands**, repository structure, CI/CD, API contracts, DB schema, and UI/animation specs.

> Abbreviations: CF = Cloudflare, D1 = Cloudflare D1 (SQLite), Hono = Hono framework, RHF = React Hook Form.

---

## 0) Goal & Non‑Goals

**Goal**: A public monorepo for the Stamp Card app (front‑end public, shared packages public), with a **private backend** submodule. Frontend deploys to **Vercel**. API on **Cloudflare Workers** with **D1**. Auth = **Better Auth** with Google OAuth. Forms = **RHF + zod**. UI = **Tailwind + Headless UI**. Animations = **GSAP** for the stamp press interaction. Sharing: **public URL** or **user‑ID restricted**.

**Non‑Goals** (initial phase): multi‑tenant orgs, payments, variable slot counts (fixed at 15), theme marketplace.

---

## 1) Repositories & Access Model

* **Public Monorepo** (e.g. `github.com/<org>/stampgame`)

  * Contains `apps/web`, `packages/*`, tooling, docs.
  * Contains **git submodule** at `apps/api` pointing to private repo.
* **Private API Repo** (e.g. `github.com/<org>/stampgame-api-private`)

  * Contains Hono code, DB schema, migrations, Wrangler config.

### 1.1 Submodule Layout

```
/apps
  /web            # Next.js (Vercel)
  /api            # git submodule → private repo
/packages
  /ui             # tailwind, headless ui, gsap helpers
  /db             # drizzle types & schema (shared types only; migrations live in private api)
  /config         # env schema (zod), runtime constants, tsconfig bases
```

### 1.2 Git Requirements for Agent

* Ability to create **two** repositories and connect submodule.
* Configure **deploy keys** or PAT for checking out the private submodule in CI (read‑only for public build; read‑write for API CI).

#### 1.2.1 Submodule Commands

```bash
# From monorepo root (public)
git submodule add git@github.com:<org>/stampgame-api-private.git apps/api
# Pin to a commit in CI to ensure reproducible builds
git submodule update --init --recursive
```

---

## 2) Package Manager & Tooling

* **pnpm** workspaces
* **Turborepo** for tasks caching
* TypeScript strict, ESLint, Prettier

### 2.1 Root Files

```
README.md
pnpm-workspace.yaml
package.json
 turbo.json
 tsconfig.base.json
 .editorconfig
 .gitignore
 .gitattributes
 .tool-versions (optional for asdf)
```

**pnpm-workspace.yaml**

```yaml
packages:
  - apps/*
  - packages/*
```

**package.json (root)**

```json
{
  "name": "stampgame-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0",
    "typescript": "^5.6.0"
  }
}
```

**turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false },
    "lint": {},
    "typecheck": {}
  }
}
```

**tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@ui/*": ["packages/ui/src/*"],
      "@db/*": ["packages/db/src/*"],
      "@config/*": ["packages/config/src/*"]
    }
  }
}
```

---

## 3) Environment & Secrets

### 3.1 Secret Names (standardize)

* **Frontend (Vercel Project: `stampgame-web`)**

  * `NEXT_PUBLIC_API_BASE` (e.g. `https://api.stampgame.workers.dev`)
  * `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` (optional)
  * `NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID` (from API)
* **API (Cloudflare Workers Project: `stampgame-api`)**

  * `BETTER_AUTH_GOOGLE_CLIENT_ID`
  * `BETTER_AUTH_GOOGLE_CLIENT_SECRET`
  * `BETTER_AUTH_JWT_SECRET` (32+ bytes)
  * `ORIGIN_WEB` (CORS allowlist, e.g. `https://stampgame.vercel.app`)
  * `CF_ACCOUNT_ID` (wrangler uses local config too)
  * `DATABASE_ID` (D1 binding name)
  * `KV_RATE_LIMIT` (KV namespace binding name)

### 3.2 .env.example (for local dev)

```
NEXT_PUBLIC_API_BASE=http://localhost:8787
NEXT_PUBLIC_BETTER_AUTH_CLIENT_ID=local
```

Workers secrets via `wrangler secret put` during CI.

---

## 4) Cloudflare Setup (API)

### 4.1 Wrangler Project

* Name: `stampgame-api`
* Route: `api.stampgame.workers.dev/*` (via CF DNS)

**apps/api/wrangler.toml** (private repo)

```toml
name = "stampgame-api"
main = "src/index.ts"
compatibility_date = "2024-10-01"

[[d1_databases]]
binding = "DB"
database_name = "stampgame"
database_id = "${DATABASE_ID}"

[[kv_namespaces]]
binding = "KV_RATE_LIMIT"
id = "${KV_RATE_LIMIT}"

[vars]
ORIGIN_WEB = "${ORIGIN_WEB}"
```

### 4.2 D1 Provisioning (idempotent)

```bash
# create if not exists
wrangler d1 create stampgame || true
# show list to parse ID
wrangler d1 list
# apply migrations
wrangler d1 migrations apply stampgame
```

### 4.3 KV for Rate Limit

```bash
wrangler kv namespace create KV_RATE_LIMIT || true
```

### 4.4 DNS / Custom Domain (optional)

* Map `api.stampgame.workers.dev` to Worker routes.

---

## 5) Vercel Setup (Frontend)

* Project: `stampgame-web` → Framework **Next.js**
* Build command: `pnpm --filter web... build`
* Output: `.next`
* Env: set `NEXT_PUBLIC_API_BASE` to Worker URL
* DOMAINS: `stampgame.vercel.app` (+ custom domain if any)

**apps/web/vercel.json** (optional)

```json
{ "version": 2 }
```

---

## 6) CI/CD (GitHub Actions)

### 6.1 Monorepo CI (public)

**.github/workflows/ci.yml**

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm lint && pnpm typecheck
```

### 6.2 API Deploy (private repo)

**.github/workflows/deploy-api.yml** (in `stampgame-api-private`)

```yaml
name: Deploy API
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm build
      - name: Wrangler Publish
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: deploy
        env:
          ORIGIN_WEB: ${{ secrets.ORIGIN_WEB }}
          DATABASE_ID: ${{ secrets.DATABASE_ID }}
          KV_RATE_LIMIT: ${{ secrets.KV_RATE_LIMIT }}
```

### 6.3 Web Deploy (public)

Prefer Vercel Git Integration. If Actions is required:
**.github/workflows/deploy-web.yml**

```yaml
name: Deploy Web
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { submodules: recursive }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm --filter web... build
      - name: Vercel Deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
          prod: true
```

---

## 7) Database Schema (Drizzle for SQLite/D1)

Source of truth lives in **private api**. Shared types mirrored in `packages/db`.

**Key Tables**: `users`, `stamp_cards`, `card_assignees`, `stamps`, `share_links`.

* Slots fixed 15.
* `limit_daily` boolean; JS computes JST day string `YYYY-MM-DD` into `local_day_jst` on insert.
* Unique `(card_id, index_in_card)` to prevent double-press on same slot.

*(Full schema + SQL already provided in earlier design; include Drizzle model files here as `src/db/schema.ts` with matching columns.)*

### 7.1 Migrations

* Use `drizzle-kit generate` into `drizzle/` and apply via `wrangler d1 migrations apply`.

---

## 8) API (Hono on Workers)

**Base URL**: `${WORKER_URL}/api`

### 8.1 Middlewares

* `auth()` Better Auth session extraction → `c.get('authUserId')`.
* `cors()` allow `ORIGIN_WEB`.
* `rateLimit()` using `KV_RATE_LIMIT` with token bucket keyed by `userId` or IP for anonymous.

### 8.2 Routes

* `GET /me` → profile + owned/assigned cards (titles, counts)
* `POST /cards` → create (zod: `title`, `isPublic`, `limitDaily`, `stampHasDate`)
* `GET /cards/:cardId` → details inc. `stamps[]`, `slotsCount`, permissions
* `PATCH /cards/:cardId` → update
* `DELETE /cards/:cardId` → delete
* `POST /cards/:cardId/stamps` → press

  * inputs: optional `indexInCard`
  * logic: if `limitDaily`, ensure no stamp for `(cardId, userId, localDayJst)`; pick smallest empty slot [1..15] if not provided; upsert fails if slot busy → return 409
* `DELETE /cards/:cardId/stamps/:stampId` → unpress (authz: owner/editor or self)
* `POST /cards/:cardId/share-links` → create token (optional `canWrite`, `expiresAt`)
* `POST /cards/:cardId/assignments` → add userId
* `DELETE /cards/:cardId/assignments/:userId`
* `GET /public/:slug` → public view payload (no auth; `canWrite` still enforced on POST)

### 8.3 Zod Contracts (shared)

* `CardCreateInput`, `CardUpdateInput`, `StampPressInput`, `ShareLinkCreateInput`, `AssignUserInput`

### 8.4 Error Codes

* 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict (slot filled / daily limit), 422 validation.

---

## 9) Frontend (Next.js on Vercel)

### 9.1 App Router structure

```
apps/web/src/app
  /(auth)/signin/page.tsx
  /(dashboard)/page.tsx                 # Home (profile + cards)
  /cards/new/page.tsx                   # Create form
  /cards/[cardId]/page.tsx              # Detail (grid 5x3, press button)
  /p/[slug]/page.tsx                    # Public page
  /api                                  # route-handlers for client-only helpers if needed
```

### 9.2 Libraries

* `@tanstack/react-query` for server state
* `react-hook-form`, `zod`, `@hookform/resolvers/zod`
* `tailwindcss`, `@headlessui/react`
* `gsap`

### 9.3 RHF Forms

**Create Card Form fields**

* title: string(1–64)
* isPublic: boolean
* limitDaily: boolean
* stampHasDate: boolean

### 9.4 Components (contracts)

* `<stampgameGrid slots={15} stamps={Stamp[]} onSlotPress(index) />`
* `<PressButton onPress/>` with loading/disabled on daily limit
* `<ShareDialog onGenerateLink(canWrite, expiresAt)/>` returns `token`
* `<AssignUserForm onAssign(userId)/>`

### 9.5 State & Queries

* `useMe()` → `/me`
* `useCard(cardId)` → `/cards/:id`
* `usePress(cardId)` → mutation; on success invalidate `useCard`

---

## 10) Animation Spec (GSAP)

### 10.1 Press Animation

* Target: stamp slot cell
* Sequence: `scale 0.95 → 1.08 (overshoot) → 1`, `rotateZ ±2deg jitter`, `drop-shadow increase`, duration ~0.45s (ease: back.out(1.7))
* If `stampHasDate`: date label fades/slide from `y:-8, opacity:0 → y:0, opacity:1`

### 10.2 Unpress Animation

* Reverse: `opacity 1→0`, `scale 1→0.9`, duration ~0.25s then remove from DOM

### 10.3 Performance

* Use `will-change: transform`; batch via gsap context; only animate selected slot.

---

## 11) Auth (Better Auth) + Google

* Frontend: sign‑in page triggers OAuth; on success, backend issues session; store httpOnly cookie.
* On first login, prompt nickname + userId (unique). POST `/me` update (or part of callback handler).
* API trusts `userId` from session middleware.

---

## 12) Rate Limiting & Abuse Controls

* **KV bucket**: key = `press:<userId>:<dayJst>` increment with TTL 60s for burst, and daily cap check via DB.
* Enforce CORS on origin.
* Optionally enable CF WAF Managed Rules.

---

## 13) Testing & QA

* **Unit**: zod schemas, slot picking helper, JST day function.
* **Integration**: press API with daily limit on/off; public slug fetch.
* **E2E**: Playwright

**packages/config/jest.setup.ts** for test setup (or Vitest).

---

## 14) Seed & Dev Conveniences

* `pnpm dev` runs: API (wrangler dev) + Web concurrently (use two terminals or `concurrently`).
* Seed script inserts a demo user + one card + few stamps.

---

## 15) Idempotent Runbook (Step‑by‑Step for Agent)

1. **Create Repos**

   * Create public repo `stampgame` and private repo `stampgame-api-private`.
2. **Scaffold Monorepo**

   * Initialize pnpm workspace, turbo, root configs (files in §2).
   * Create `apps/web`, `packages/ui`, `packages/db`, `packages/config`.
3. **Add Submodule**

   * `git submodule add` private repo into `apps/api`.
4. **Provision Cloudflare**

   * `wrangler login` (or use API token in CI).
   * `wrangler d1 create stampgame || true` → capture `DATABASE_ID`.
   * `wrangler kv namespace create KV_RATE_LIMIT || true` → capture id.
   * Populate `apps/api/wrangler.toml` with bindings.
5. **Secrets**

   * In private repo, set GitHub Secrets: `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `DATABASE_ID`, `KV_RATE_LIMIT`, `ORIGIN_WEB`, `BETTER_AUTH_*`.
   * In Vercel project, set `NEXT_PUBLIC_API_BASE` and public client id.
6. **Implement API** (private repo)

   * Add Hono app with routes (§8), Drizzle schema (§7), migrations, middleware.
7. **Implement Frontend** (public repo)

   * App Router pages (§9), RHF forms, data hooks, GSAP animations (§10).
8. **CI/CD**

   * Configure actions (§6) or native integrations (preferred for Vercel).
9. **Domains**

   * Map Worker route to `api.stampgame.workers.dev`; set CORS origin; set Next.js env to use that.
10. **Smoke Test**

* Create card, press stamp, verify daily limit on/off, share link read.

---

## 16) File Trees (minimum)

**apps/web**

```
src/
  app/(dashboard)/page.tsx
  app/cards/new/page.tsx
  app/cards/[cardId]/page.tsx
  app/p/[slug]/page.tsx
  lib/api.ts
  lib/auth.ts
  components/
    stampgameGrid.tsx
    PressButton.tsx
    ShareDialog.tsx
    AssignUserForm.tsx
    Toast.tsx
  styles/globals.css
```

**apps/api (private)**

```
src/
  index.ts
  middleware/auth.ts
  middleware/cors.ts
  routes/
    me.ts
    cards.ts
    stamps.ts
    shares.ts
  db/
    schema.ts
    client.ts
  utils/
    jst.ts
    rateLimit.ts
wrangler.toml
drizzle/
  000_init.sql
  ...
```

**packages/ui**

```
src/
  components/
    Card.tsx
    GridCell.tsx
  animations/
    press.ts
```

**packages/db**

```
src/
  types.ts         # inferred types from schema (duplicated, no migrations)
  zod.ts
```

**packages/config**

```
src/
  env.ts           # zod safe parse for env
  constants.ts
```

---

## 17) Security Notes

* Keep private repo private; submodule URL must be SSH or token‑less read via deploy key.
* Never expose `BETTER_AUTH_GOOGLE_CLIENT_SECRET` to frontend.
* Validate all IDs with zod; return 404 for unauthorized access to avoid info leakage.

---

## 18) Observability (optional nice‑to‑have)

* CF Analytics Engine or Logpush
* Simple request metrics (counter by route) in Durable Object / Analytics Engine

---

## 19) Acceptance Checklist

* [ ] Public repo builds and deploys to Vercel; homepage loads
* [ ] Private API deploys; `/api/health` returns 200
* [ ] Create card → appears in dashboard
* [ ] Press stamp → slot animates, DB row created
* [ ] Daily limit ON enforces 409 on second press same day
* [ ] Share link GET works; write blocked unless `canWrite`
* [ ] Assign user by userId → that user can press

---

## 20) Appendix — Helpful Snippets

### 20.1 Slot Selection helper (API)

```ts
export function pickFirstEmptySlot(used: number[], total = 15) {
  const set = new Set(used);
  for (let i = 1; i <= total; i++) if (!set.has(i)) return i;
  return null;
}
```

### 20.2 JST Day

```ts
export function jstDayISO(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [y, m, da] = fmt.format(d).split('/');
  return `${y}-${m}-${da}`; // YYYY-MM-DD
}
```

### 20.3 CORS

```ts
const allow = (origin?: string) => origin && origin === env.ORIGIN_WEB;
```
