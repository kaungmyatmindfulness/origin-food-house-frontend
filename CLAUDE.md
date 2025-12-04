# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Origin Food House is an enterprise-grade restaurant management platform built as a **Turborepo monorepo**. It includes a NestJS backend API and multiple Next.js frontend applications, supporting multi-language capabilities (English, Chinese, Myanmar, Thai).

## Monorepo Structure

| Package                             | Description                     | Port | Tech        | CLAUDE.md                                            |
| ----------------------------------- | ------------------------------- | ---- | ----------- | ---------------------------------------------------- |
| **Backend**                         |                                 |      |             |                                                      |
| `apps/api`                          | NestJS REST API + WebSocket     | 3000 | NestJS 11   | [Guide](apps/api/CLAUDE.md)                          |
| **Frontend Apps**                   |                                 |      |             |                                                      |
| `apps/restaurant-management-system` | POS system for restaurant staff | 3002 | Next.js SSG | [Guide](apps/restaurant-management-system/CLAUDE.md) |
| `apps/self-ordering-system`         | Customer-facing self-ordering   | 3001 | Next.js SSR | [Guide](apps/self-ordering-system/CLAUDE.md)         |
| `apps/admin-platform`               | Platform admin (in development) | 3003 | Next.js SSR | [Guide](apps/admin-platform/CLAUDE.md)               |
| **Shared Packages**                 |                                 |      |             |                                                      |
| `packages/api`                      | Shared API utilities + types    | -    | TypeScript  | -                                                    |
| `packages/ui`                       | Shared shadcn/ui components     | -    | React       | -                                                    |
| `packages/eslint-config`            | Shared ESLint configuration     | -    | -           | -                                                    |
| `packages/typescript-config`        | Shared TypeScript configuration | -    | -           | -                                                    |

**Each app has its own CLAUDE.md with detailed patterns. Refer to the appropriate app's guide for specific conventions.**

---

## Essential Commands

### Development

```bash
npm install                                             # Install all dependencies

# Frontend apps
npm run dev                                             # Run all frontend apps
npm run dev --filter=@app/restaurant-management-system  # Run RMS (port 3002)
npm run dev --filter=@app/self-ordering-system          # Run SOS (port 3001)
npm run dev --filter=@app/admin-platform                # Run Admin (port 3003)

# Backend API (run in apps/api directory)
cd apps/api
npm run docker:up                                       # Start PostgreSQL database
npm run db:migrate                                      # Run database migrations
npm run db:generate                                     # Generate Prisma client
npm run dev                                             # Start API server (port 3000)
```

### Quality Gates (MUST PASS before completion)

```bash
# Monorepo-wide (from root)
npm run format       # Format code with Prettier
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # TypeScript type checking (0 errors)
npm run build        # Build all apps

# Backend-specific (from apps/api)
cd apps/api
npm run format       # Format backend code
npm run lint         # Lint backend
npm run check-types  # Type check backend
npm test             # Run backend tests
npm run build        # Build backend
```

### OpenAPI Type Generation

**CRITICAL**: When backend API changes, regenerate frontend types:

```bash
npm run generate:api  # Regenerates packages/api/src/generated/types.gen.ts
```

---

## Tech Stack

### Backend (`apps/api`)

| Category    | Technology                       |
| ----------- | -------------------------------- |
| Framework   | NestJS 11, TypeScript 5.9        |
| Database    | PostgreSQL + Prisma 7            |
| Auth        | Auth0 (JWT), Passport.js         |
| Real-time   | Socket.IO (WebSocket)            |
| File Upload | AWS S3, Sharp (image processing) |
| Queue       | Bull + Redis                     |
| API Docs    | Swagger/OpenAPI (auto-generated) |

### Frontend (All Next.js Apps)

| Category         | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15 (App Router), React 19, TypeScript |
| State Management | Zustand (client), React Query (server)        |
| Styling          | Tailwind CSS v4, shadcn/ui via `@repo/ui`     |
| API Client       | `apiFetch` + auto-generated OpenAPI types     |
| Forms            | react-hook-form + Zod                         |
| Real-time        | Socket.IO client                              |
| i18n             | next-intl (4 languages: en, zh, my, th)       |

---

## Key Architectural Decisions

| Decision               | Rationale                                         |
| ---------------------- | ------------------------------------------------- |
| Turborepo              | Fast builds, shared packages, intelligent caching |
| OpenAPI auto-gen types | Single source of truth, compile-time type safety  |
| NestJS + Prisma        | Type-safe API, modern Node.js patterns            |
| Zustand over Redux     | Minimal boilerplate, better TypeScript support    |
| Feature-Sliced Design  | Better organization, enforces separation          |

---

## File Naming Conventions

**These conventions apply across all packages:**

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Components | PascalCase.tsx | `CategoryCard.tsx`    |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Hooks      | `use*.ts`      | `useProtected.ts`     |
| Utils      | kebab-case.ts  | `format-currency.ts`  |

---

## Important Shared Files

| File                                      | Purpose                      |
| ----------------------------------------- | ---------------------------- |
| `packages/api/src/generated/types.gen.ts` | Auto-generated OpenAPI types |
| `packages/ui/src/components/`             | Shared UI components         |
| `packages/ui/src/styles/globals.css`      | Global styles & color tokens |

---

## App-Specific Documentation

**Backend API** - NestJS architecture, Prisma, security, API documentation:

@apps/api/CLAUDE.md

**RMS (POS)** - SSG patterns, tablet-first design, offline support:

@apps/restaurant-management-system/CLAUDE.md

**SOS (Customer)** - SSR patterns, session tokens, cart sync:

@apps/self-ordering-system/CLAUDE.md

**Admin** - SSR patterns, Auth0 React SDK:

@apps/admin-platform/CLAUDE.md

---

## Pre-Completion Checklist

### All Apps

```bash
npm run format       # Format code
npm run lint         # Lint (0 warnings)
npm run check-types  # Type check (0 errors)
npm run build        # Build succeeds
```

### Backend (apps/api)

- [ ] Input validation with class-validator DTOs
- [ ] Swagger documentation (@ApiOperation, @ApiResponse)
- [ ] Authentication guards applied where needed
- [ ] Store isolation enforced (multi-tenancy)
- [ ] Soft deletes used (no hard deletes)
- [ ] Transactions for multi-step DB operations

### Frontend (all Next.js apps)

- [ ] Used `@repo/ui` components
- [ ] API types imported from `@repo/api/generated/types`
- [ ] No `any` types, use `import type` for type-only imports
- [ ] Translations in all 4 languages (en, zh, my, th)

---

**Remember:** Quality over speed. Always run all quality gates before completion.
