# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Origin Food House is an enterprise-grade restaurant management system built as a **Turborepo monorepo** with Next.js 15, React 19, and TypeScript. The system supports multi-language capabilities (English, Chinese, Myanmar, Thai) and follows clean architecture patterns.

**Monorepo Structure:**

| Package                             | Description                          | Port | Rendering       | CLAUDE.md                                            |
| ----------------------------------- | ------------------------------------ | ---- | --------------- | ---------------------------------------------------- |
| `apps/restaurant-management-system` | POS system for restaurant staff      | 3002 | **Static (SG)** | [Guide](apps/restaurant-management-system/CLAUDE.md) |
| `apps/self-ordering-system`         | Customer-facing self-ordering        | 3001 | **SSR**         | [Guide](apps/self-ordering-system/CLAUDE.md)         |
| `apps/admin-platform`               | Platform admin (in development)      | 3003 | **SSR**         | [Guide](apps/admin-platform/CLAUDE.md)               |
| `packages/api`                      | Shared API utilities + OpenAPI types | -    | -               | -                                                    |
| `packages/ui`                       | Shared shadcn/ui components (52+)    | -    | -               | -                                                    |
| `packages/eslint-config`            | Shared ESLint configuration          | -    | -               | -                                                    |
| `packages/typescript-config`        | Shared TypeScript configuration      | -    | -               | -                                                    |

**Note:** Each app has its own CLAUDE.md with app-specific routes, features, and rendering patterns. This root file covers shared conventions.

---

## Rendering Strategies

Each app uses a different rendering strategy based on its requirements:

| App       | Strategy                    | Rationale                                                |
| --------- | --------------------------- | -------------------------------------------------------- |
| **RMS**   | Static Generation (SG)      | Future Tauri desktop integration, offline POS capability |
| **SOS**   | Server-Side Rendering (SSR) | SEO for menu pages, fast first paint on mobile           |
| **Admin** | Server-Side Rendering (SSR) | Fresh admin data, security (no client exposure)          |

### Quick Reference

```typescript
// RMS: Static Generation - ALL client components
'use client';
export default function Page() {
  const { data } = useQuery({ ... });  // Client-side fetch
  return <Content data={data} />;
}

// SOS/Admin: SSR - Server component + client hydration
export default async function Page() {
  const data = await fetchData();      // Server-side fetch
  return <ClientComponent initialData={data} />;
}
```

**See each app's CLAUDE.md for detailed patterns and examples.**

---

## Essential Commands

### Development

```bash
npm install                                          # Install dependencies
npm run dev                                          # Run all apps (POS :3002, SOS :3001)
npm run dev --filter=@app/restaurant-management-system  # Run specific app
npm run build                                        # Build all apps
```

### Quality Gates (MUST PASS before completion)

```bash
npm run format       # Format code with Prettier
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # TypeScript type checking (0 errors)
npm run build        # Ensure all apps build successfully
```

### Testing (RMS only)

```bash
npm test --workspace=@app/restaurant-management-system              # Run all tests
npm run test:watch --workspace=@app/restaurant-management-system    # Watch mode
npm run test:coverage --workspace=@app/restaurant-management-system # Coverage report
```

### OpenAPI Type Generation

**CRITICAL**: When backend API changes, regenerate types:

```bash
npm run generate:api
```

---

## Tech Stack Quick Reference

| Category         | Technology                                    |
| ---------------- | --------------------------------------------- |
| Framework        | Next.js 15 (App Router), React 19, TypeScript |
| State Management | Zustand (client), React Query (server)        |
| Styling          | Tailwind CSS v4, shadcn/ui via `@repo/ui`     |
| API              | `apiFetch` + auto-generated OpenAPI types     |
| Forms            | react-hook-form + Zod                         |
| Real-time        | Socket.IO                                     |
| i18n             | next-intl (cookie-based, 4 languages)         |

---

## Key Architectural Decisions

| Decision              | Rationale                                            |
| --------------------- | ---------------------------------------------------- |
| Turborepo             | Fast builds, shared packages, intelligent caching    |
| Auto-generated types  | Single source of truth, compile-time safety          |
| Zustand over Redux    | Minimal boilerplate, better TypeScript support       |
| Feature-Sliced Design | Better organization, enforces separation of concerns |
| Cookie-based i18n     | Clean URLs, persists across navigation               |

---

## Detailed Documentation

For comprehensive guidelines, refer to these detailed documents:

@.claude/docs/architecture.md
@.claude/docs/code-quality.md
@.claude/docs/navigation-patterns.md
@.claude/docs/props-conventions.md
@.claude/docs/design-system.md
@.claude/docs/patterns.md
@.claude/docs/i18n.md
@.claude/docs/anti-patterns.md
@.claude/docs/workflows.md

---

## Quick Reference Cards

### File Naming Conventions

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Components | PascalCase.tsx | `CategoryCard.tsx`    |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Query Keys | `*.keys.ts`    | `menu.keys.ts`        |
| Hooks      | `use*.ts`      | `useProtected.ts`     |

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

**ALWAYS import API types directly from `@repo/api/generated/types`:**

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

| File                                      | Purpose                      |
| ----------------------------------------- | ---------------------------- |
| `apps/*/src/utils/apiFetch.ts`            | API client config            |
| `packages/api/src/generated/types.gen.ts` | Auto-generated types         |
| `packages/ui/src/components/`             | Shared UI components (52+)   |
| `packages/ui/src/styles/globals.css`      | Global styles & color tokens |
| `apps/*/messages/[locale]/*.json`         | Translation files            |
| `apps/*/src/i18n/`                        | i18n configuration           |

---

## Pre-Completion Checklist

### Quality Gates

- [ ] `npm run format`
- [ ] `npm run lint` (0 warnings)
- [ ] `npm run check-types` (0 errors)
- [ ] `npm run build`

### Code Quality

- [ ] Used `@repo/ui` components
- [ ] API types imported directly from `@repo/api/generated/types`
- [ ] No type re-export files (import from source)
- [ ] No type casting (`as Type[]`) for API responses
- [ ] No `any` types
- [ ] `import type` for type-only imports

### Design System

- [ ] Semantic colors only (no raw Tailwind)
- [ ] Component variant props (not custom classes)
- [ ] No arbitrary values (`w-[234px]`)

### i18n

- [ ] Translations in all 4 languages (en, zh, my, th)
- [ ] No hardcoded display strings
- [ ] Routes WITHOUT locale prefix

---

## Additional Documentation

- **`README.md`** - Project overview and architecture details
- **`packages/api/README.md`** - API package usage and OpenAPI integration

---

**Remember:** Quality over speed. Always run all quality gates before completion.
