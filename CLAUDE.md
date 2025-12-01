# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Origin Food House is an enterprise-grade restaurant management platform built as a **Turborepo monorepo**. It includes a NestJS backend API and multiple Next.js frontend applications, supporting multi-language capabilities (English, Chinese, Myanmar, Thai) and clean architecture patterns.

**Monorepo Structure:**

| Package                             | Description                          | Port | Tech        | CLAUDE.md                                            |
| ----------------------------------- | ------------------------------------ | ---- | ----------- | ---------------------------------------------------- |
| **Backend**                         |                                      |      |             |                                                      |
| `apps/api`                          | NestJS REST API + WebSocket          | 3000 | NestJS 11   | [Guide](apps/api/CLAUDE.md)                          |
| **Frontend Apps**                   |                                      |      |             |                                                      |
| `apps/restaurant-management-system` | POS system for restaurant staff      | 3002 | Next.js SSG | [Guide](apps/restaurant-management-system/CLAUDE.md) |
| `apps/self-ordering-system`         | Customer-facing self-ordering        | 3001 | Next.js SSR | [Guide](apps/self-ordering-system/CLAUDE.md)         |
| `apps/admin-platform`               | Platform admin (in development)      | 3003 | Next.js SSR | [Guide](apps/admin-platform/CLAUDE.md)               |
| **Shared Packages**                 |                                      |      |             |                                                      |
| `packages/api`                      | Shared API utilities + OpenAPI types | -    | TypeScript  | -                                                    |
| `packages/ui`                       | Shared shadcn/ui components (52+)    | -    | React       | -                                                    |
| `packages/eslint-config`            | Shared ESLint configuration          | -    | -           | -                                                    |
| `packages/typescript-config`        | Shared TypeScript configuration      | -    | -           | -                                                    |

**Note:** Each app has its own CLAUDE.md with app-specific patterns. This root file covers **monorepo-wide conventions** and **frontend-shared patterns**. See `apps/api/CLAUDE.md` for backend-specific guidelines.

---

## Frontend Rendering Strategies

Each frontend app uses a different rendering strategy:

| App       | Strategy                    | Rationale                                                |
| --------- | --------------------------- | -------------------------------------------------------- |
| **RMS**   | Static Generation (SG)      | Future Tauri desktop integration, offline POS capability |
| **SOS**   | Server-Side Rendering (SSR) | SEO for menu pages, fast first paint on mobile           |
| **Admin** | Server-Side Rendering (SSR) | Fresh admin data, security (no client exposure)          |

**See each app's CLAUDE.md for detailed patterns and examples.**

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
npm run check-types  # Type check backend (uses tsc --noEmit)
npm test             # Run backend tests
npm run build        # Build backend
```

### Testing

```bash
# Frontend (RMS only)
npm test --workspace=@app/restaurant-management-system              # Run all tests
npm run test:watch --workspace=@app/restaurant-management-system    # Watch mode
npm run test:coverage --workspace=@app/restaurant-management-system # Coverage report

# Backend (from apps/api)
cd apps/api
npm test             # Run all unit tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:e2e     # End-to-end tests
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

### Frontend (`apps/*` except `api`)

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

| Decision                  | Rationale                                            |
| ------------------------- | ---------------------------------------------------- |
| Turborepo                 | Fast builds, shared packages, intelligent caching    |
| OpenAPI auto-gen types    | Single source of truth, compile-time type safety     |
| NestJS + Prisma (backend) | Type-safe API, modern Node.js patterns               |
| Zustand over Redux        | Minimal boilerplate, better TypeScript support       |
| Feature-Sliced Design     | Better organization, enforces separation of concerns |
| Cookie-based i18n         | Clean URLs, persists across navigation               |

---

## Detailed Documentation

### Frontend Guidelines (applies to all Next.js apps)

@.claude/docs/architecture.md
@.claude/docs/code-quality.md
@.claude/docs/navigation-patterns.md
@.claude/docs/props-conventions.md
@.claude/docs/design-system.md
@.claude/docs/patterns.md
@.claude/docs/i18n.md
@.claude/docs/anti-patterns.md
@.claude/docs/workflows.md

### Backend Guidelines

See `apps/api/CLAUDE.md` which references detailed docs:

- `apps/api/.claude/docs/` - NestJS architecture, Prisma patterns, security, API documentation

---

## Quick Reference Cards (Frontend)

### File Naming Conventions

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Components | PascalCase.tsx | `CategoryCard.tsx`    |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Query Keys | `*.keys.ts`    | `menu.keys.ts`        |
| Hooks      | `use*.ts`      | `useProtected.ts`     |

**Backend naming:** See `apps/api/CLAUDE.md` for NestJS conventions (controllers, services, DTOs, modules).

### Import Order

```typescript
'use client';
// 1. React & Next.js
// 2. Third-party libraries
// 3. @repo/* packages
// 4. @/features/*
// 5. @/common/*
// 6. Types (import type)
```

### Type Import Conventions

**ALWAYS import API types directly for frontend projects from `@repo/api/generated/types`:**

```typescript
// ✅ CORRECT - Direct import
import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ WRONG - Import from feature type file
import type { Category } from '@/features/menu/types/category.types';

// ❌ WRONG - Type casting API responses
const items = (response?.data ?? []) as MenuItemResponseDto[];

// ✅ CORRECT - Let TypeScript infer
const items = response?.data ?? [];
```

**Feature type files should ONLY contain:**

- Frontend-only UI state types (e.g., `SalesView`, `SalesPanel`)
- Runtime enums (e.g., `TableStatus` for `Object.values()`)
- Type extensions for missing API fields (documented with TODO)

### Semantic Color Tokens

| Token              | Usage                        |
| ------------------ | ---------------------------- |
| `background`       | Page backgrounds             |
| `foreground`       | Primary text                 |
| `muted-foreground` | Secondary text, descriptions |
| `primary`          | Brand color, CTAs            |
| `destructive`      | Delete, error actions        |
| `border`           | Borders                      |

### Navigation Decision Tree

```
User-initiated navigation?
├─ YES → Simple? → Use <Link> (with Button asChild)
│        Complex logic first? → Button onClick + router.push()
└─ NO → Redirect? → router.replace()
        After action? → router.push()
        Go back? → router.back()
```

---

## Important Files & Locations

### Shared Packages

| File                                      | Purpose                      |
| ----------------------------------------- | ---------------------------- |
| `packages/api/src/generated/types.gen.ts` | Auto-generated OpenAPI types |
| `packages/ui/src/components/`             | Shared UI components (52+)   |
| `packages/ui/src/styles/globals.css`      | Global styles & color tokens |

### Frontend Apps

| File                              | Purpose            |
| --------------------------------- | ------------------ |
| `apps/*/src/utils/apiFetch.ts`    | API client config  |
| `apps/*/messages/[locale]/*.json` | Translation files  |
| `apps/*/src/i18n/`                | i18n configuration |

### Backend (`apps/api`)

| File                             | Purpose                        |
| -------------------------------- | ------------------------------ |
| `apps/api/prisma/schema.prisma`  | Database schema                |
| `apps/api/src/main.ts`           | App entry point, Swagger setup |
| `apps/api/src/generated/prisma/` | Generated Prisma client        |
| `apps/api/.env`                  | Backend environment variables  |

---

## Pre-Completion Checklist

### Quality Gates (All Apps)

```bash
npm run format       # Format code
npm run lint         # Lint (0 warnings)
npm run check-types  # Type check (0 errors)
npm run build        # Build succeeds
```

### Frontend Code Quality

- [ ] Used `@repo/ui` components
- [ ] API types imported directly from `@repo/api/generated/types`
- [ ] No type re-export files (import from source)
- [ ] No type casting (`as Type[]`) for API responses
- [ ] No `any` types
- [ ] `import type` for type-only imports

### Frontend Design System

- [ ] Semantic colors only (no raw Tailwind)
- [ ] Component variant props (not custom classes)
- [ ] No arbitrary values (`w-[234px]`)

### Frontend i18n

- [ ] Translations in all 4 languages (en, zh, my, th)
- [ ] No hardcoded display strings
- [ ] Routes WITHOUT locale prefix

### Backend Code Quality (see `apps/api/CLAUDE.md` for full checklist)

- [ ] Input validation with class-validator DTOs
- [ ] Swagger documentation (@ApiOperation, @ApiResponse)
- [ ] Authentication guards applied where needed
- [ ] Store isolation enforced (multi-tenancy)
- [ ] Soft deletes used (no hard deletes)
- [ ] Transactions for multi-step DB operations

---

## Additional Documentation

- **`README.md`** - Project overview and architecture details
- **`packages/api/README.md`** - API package usage and OpenAPI integration
- **`apps/api/README.md`** - Backend API documentation

---

**Remember:** Quality over speed. Always run all quality gates before completion.
