# Stampgame Monorepo

This repository hosts the public codebase for the Stampgame application.

## Structure

- `apps/web` – Next.js frontend deployed to Vercel.
- `apps/api` – Private Cloudflare Worker API (git submodule, see below).
- `packages/ui` – Shared UI components and animation helpers.
- `packages/db` – Shared Drizzle types and validation schemas.
- `packages/config` – Environment parsing and runtime configuration.

## Submodule Setup

The backend API lives in a private repository and is mounted as a git submodule at `apps/api`.
When the private repository is available, run:

```bash
git submodule add git@github.com:<org>/stampgame-api-private.git apps/api
git submodule update --init --recursive
```

## Tooling

- pnpm 9
- Turborepo 2
- TypeScript 5.6
- ESLint 9
- Prettier 3

## Getting Started

```bash
pnpm install
pnpm dev
```

Refer to `plan.md` for the full implementation runbook.
