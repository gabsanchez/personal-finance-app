# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **ORM:** Prisma 7 with PostgreSQL (Neon serverless)
- **Styling:** Tailwind CSS v4 + shadcn/ui

## Environment

Requires a `DATABASE_URL` environment variable. The `.env` file at the project root is already configured for the AWS RDS instance.

## Common Commands

```bash
# Development
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # Run ESLint

# Prisma
npx prisma generate                        # Regenerate client after schema changes
npx prisma migrate dev --name <name>       # Create and apply a migration
npx prisma migrate deploy                  # Apply migrations in production
npx prisma studio                          # Open Prisma Studio GUI
npx prisma migrate reset                   # Reset DB and re-run all migrations (destructive)
```

## Architecture

### Key directories
- `app/` — Next.js App Router pages and layouts
- `components/ui/` — shadcn/ui primitives (auto-generated, don't edit directly)
- `lib/prisma.ts` — Prisma client singleton (import this everywhere, never instantiate directly)

### Adding shadcn components
```bash
npx shadcn@latest add <component>   # e.g. npx shadcn@latest add card
```

### Prisma config note
The datasource URL is **not** in `prisma/schema.prisma` (Prisma 7 removed it). Instead:
- Migrations: configured in `prisma.config.ts` via `datasource.url`
- Runtime: `lib/prisma.ts` passes a `PrismaNeon` adapter with `process.env.DATABASE_URL` to the `PrismaClient` constructor

## Data Model

All monetary values are stored as **cents (`BigInt`)** — never floats. Currency is a 3-char ISO code (e.g., `"USD"`).

**Core models:**

- `User` owns everything — all other models cascade-delete when a user is deleted.
- `Account` — a financial account (cash, checking, savings, credit, investment). Balances are derived from transactions starting at `openingBalanceCents`.
- `Category` — hierarchical (self-referential via `parentId`), scoped per user. `userId = null` means a system-level category. Unique per `(userId, kind, name)`.
- `Transaction` — type is `EXPENSE`, `INCOME`, or `TRANSFER`. Transfers link two transactions via a shared `transferId` UUID.
- `Budget` — monthly spending target per category, unique per `(userId, categoryId, month)`.
