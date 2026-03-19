# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Language:** TypeScript (via `ts-node`)
- **ORM:** Prisma 6 with PostgreSQL
- **Runtime:** Node.js

## Environment

Requires a `DATABASE_URL` environment variable pointing to a PostgreSQL instance. Create a `.env` file at the project root:

```
DATABASE_URL="postgresql://user:password@localhost:5432/personal_finance"
```

## Common Commands

```bash
# Run a TypeScript file directly
npx ts-node src/path/to/file.ts

# Prisma: generate client after schema changes
npx prisma generate

# Prisma: create and apply a migration
npx prisma migrate dev --name <migration-name>

# Prisma: apply migrations in production
npx prisma migrate deploy

# Prisma: open the Prisma Studio GUI
npx prisma studio

# Prisma: reset DB and re-run all migrations (destructive)
npx prisma migrate reset
```

## Data Model

All monetary values are stored as **cents (`BigInt`)** — never floats. Currency is a 3-char ISO code (e.g., `"USD"`).

**Core models and their relationships:**

- `User` owns everything — all other models cascade-delete when a user is deleted.
- `Account` — a financial account (cash, checking, savings, credit, investment) belonging to a user. Balances are derived from transactions starting at `openingBalanceCents`.
- `Category` — hierarchical (self-referential via `parentId`), scoped per user. `userId = null` means a system-level category shared across users. Unique per `(userId, kind, name)`.
- `Transaction` — the primary financial event. Type is `EXPENSE`, `INCOME`, or `TRANSFER`. Transfers link two transactions via a shared `transferId` UUID.
- `Budget` — monthly spending target per category, unique per `(userId, categoryId, month)`.

## Prisma Config

`prisma.config.ts` uses the `defineConfig` API (Prisma 6+). The schema lives at `prisma/schema.prisma` and migrations at `prisma/migrations/`. The datasource URL is read from the `DATABASE_URL` env var at runtime.
