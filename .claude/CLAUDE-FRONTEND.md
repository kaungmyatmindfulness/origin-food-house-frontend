# Frontend Shared Conventions

**This file contains patterns and conventions shared by all Next.js frontend apps (RMS, SOS, Admin).**

See each app's individual CLAUDE.md for app-specific patterns:

- [`apps/restaurant-management-system/CLAUDE.md`](../apps/restaurant-management-system/CLAUDE.md) - SSG, tablet-first, offline support
- [`apps/self-ordering-system/CLAUDE.md`](../apps/self-ordering-system/CLAUDE.md) - SSR, session tokens, cart sync
- [`apps/admin-platform/CLAUDE.md`](../apps/admin-platform/CLAUDE.md) - SSR, Auth0 React SDK

---

## Quick Reference

### Type Import Conventions

**ALWAYS import API types directly from `@repo/api/generated/types`:**

```typescript
// CORRECT - Direct import
import type { CategoryResponseDto } from '@repo/api/generated/types';

// WRONG - Import from feature type file
import type { Category } from '@/features/menu/types/category.types';

// CORRECT - Let TypeScript infer
const items = response?.data ?? [];

// WRONG - Type casting API responses
const items = (response?.data ?? []) as MenuItemResponseDto[];
```

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

## Pre-Completion Checklist (Frontend)

### Code Quality

- [ ] Used `@repo/ui` components
- [ ] API types imported directly from `@repo/api/generated/types`
- [ ] No type re-export files (import from source)
- [ ] No type casting (`as Type[]`) for API responses
- [ ] No `any` types
- [ ] `import type` for type-only imports

### Design System

- [ ] Semantic colors only (no raw Tailwind colors like `bg-white`, `text-gray-500`)
- [ ] Component variant props (not custom classes)
- [ ] No arbitrary values (`w-[234px]`)

### i18n

- [ ] Translations in all 4 languages (en, zh, my, th)
- [ ] No hardcoded display strings

---

## Detailed Documentation

The following consolidated guides cover all frontend patterns and conventions:

@frontend-rules/frontend-guide.md

@frontend-rules/frontend-patterns.md

@frontend-rules/frontend-checklist.md
