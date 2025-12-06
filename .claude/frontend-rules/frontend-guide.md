# Frontend Development Guide

This guide covers architecture, code quality, type safety, design system, and component conventions.

---

## Feature-Sliced Design

```
src/
├── app/                    # Next.js App Router (routes)
├── features/               # Domain-driven modules
│   ├── auth/
│   │   ├── components/     # Feature-specific UI
│   │   ├── constants/      # *.constants.ts
│   │   ├── hooks/          # use*.ts
│   │   ├── queries/        # *.keys.ts
│   │   ├── schemas/        # *.schemas.ts (Zod)
│   │   ├── services/       # *.service.ts
│   │   ├── store/          # *.store.ts (Zustand)
│   │   └── types/          # *.types.ts (frontend-only)
│   ├── menu/
│   └── orders/
├── common/                 # Shared app-level utilities
└── utils/                  # App-level utilities (apiFetch)
```

**File Naming:**
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `CategoryCard.tsx` |
| Constants | `*.constants.ts` | `print.constants.ts` |
| Hooks | `use*.ts` | `useProtected.ts` |
| Query Keys | `*.keys.ts` | `menu.keys.ts` |
| Schemas | `*.schemas.ts` | `print.schemas.ts` |
| Services | `*.service.ts` | `category.service.ts` |
| Stores | `*.store.ts` | `auth.store.ts` |
| Types | `*.types.ts` | `menu-item.types.ts` |

---

## Type Safety Rules

### Import API Types Directly

**CRITICAL:** Always import from `@repo/api/generated/types`:

```typescript
// ✅ CORRECT - Direct import
import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ WRONG - Import from feature type file
import type { Category } from '@/features/menu/types/category.types';
```

### No Type Re-export Files

Do NOT create files that just re-export types:

```typescript
// ❌ BAD - features/menu/types/category.types.ts
export type { CategoryResponseDto } from '@repo/api/generated/types';

// ✅ GOOD - Import directly where needed
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

**Exception:** Feature type files may contain:

- Frontend-only UI state types (`SalesView = 'quick-sale' | 'tables'`)
- Runtime enums needed for `Object.values()`
- Type extensions for missing API fields (with TODO)

### No Type Casting

```typescript
// ❌ BAD - Type casting bypasses safety
const categories = (response?.data ?? []) as CategoryResponseDto[];

// ✅ GOOD - Let TypeScript infer
const categories = response?.data ?? [];
```

### Use Type Imports

```typescript
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';
```

---

## Naming Conventions

### Variables

```typescript
// ✅ GOOD - Descriptive names
const selectedStoreId = useAuthStore((state) => state.selectedStoreId);
const isMenuItemOutOfStock = item.isOutOfStock;

// ❌ BAD - Abbreviations
const sid = useAuthStore((state) => state.storeId);
```

### Booleans

Use `is`, `has`, `should`, `can` prefixes:

```typescript
const isLoading = true;
const hasPermission = checkPermission(user);
const canEdit = userRole === 'ADMIN';
```

### Functions

Use verb prefixes:

```typescript
function getCategories(storeId: string) {}
function createMenuItem(data: CreateMenuItemDto) {}
function handleSubmit() {}
```

---

## Props Interface Conventions

**ALWAYS define named props interfaces:**

```typescript
// ✅ CORRECT
interface CategoryCardProps {
  category: CategoryResponseDto;
  onEdit: (id: string) => void;
  isLoading?: boolean;
}

export function CategoryCard({
  category,
  onEdit,
  isLoading = false,
}: CategoryCardProps) {}

// ❌ WRONG - Inline type
export function CategoryCard({ category }: { category: CategoryResponseDto }) {}
```

### Next.js 15 Page Props

```typescript
interface MenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default function MenuPage({ params }: MenuPageProps) {
  const { slug } = use(params); // Client component
  // OR
  const { slug } = await params; // Server component
}
```

### Callback Props

Prefix with `on`, use descriptive names:

```typescript
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  onValidationError: (errors: ValidationError[]) => void;
}
```

### Unused Parameters

Prefix with underscore:

```typescript
onSuccess: (_data, variables) => {
  console.log('Created:', variables.id);
},
```

---

## Design System

### Semantic Colors Only

**ALWAYS use tokens from `globals.css`:**

| Token              | Usage             |
| ------------------ | ----------------- |
| `background`       | Page backgrounds  |
| `foreground`       | Primary text      |
| `muted-foreground` | Secondary text    |
| `primary`          | Brand color, CTAs |
| `destructive`      | Delete, errors    |
| `border`           | Borders           |

```typescript
// ✅ CORRECT - Semantic tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">

// ❌ WRONG - Raw colors
<div className="bg-white text-gray-900">
<p className="text-gray-500">
```

### Use Component Variants

```typescript
// ✅ CORRECT - Use variant props
<Button variant="destructive" size="lg">Delete</Button>
<Badge variant="secondary">Pending</Badge>

// ❌ WRONG - Override with custom classes
<Button className="bg-red-600 hover:bg-red-700">Delete</Button>
```

### No Arbitrary Values

```typescript
// ❌ BAD
<div className="pt-[23px] w-[234px] text-[13px]">

// ✅ GOOD - Design system values
<div className="pt-6 w-60 text-sm">
```

### Spacing Scale

Use consistent spacing: 4, 6, 8, 12, 16, 24

```typescript
<div className="space-y-6">  {/* Between major sections */}
<div className="space-y-4">  {/* Between related elements */}
<div className="space-y-2">  {/* Tightly grouped items */}
```

---

## Import Organization

```typescript
'use client';

// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Shared packages
import { Button } from '@repo/ui/components/button';

// 4. Feature imports
import { useAuthStore } from '@/features/auth/store/auth.store';

// 5. Common utilities
import { ROUTES } from '@/common/constants/routes';

// 6. Types (last)
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

---

## Important Files

| File                                      | Purpose                |
| ----------------------------------------- | ---------------------- |
| `apps/*/src/utils/apiFetch.ts`            | API client config      |
| `packages/api/src/generated/types.gen.ts` | Auto-generated types   |
| `packages/ui/src/components/`             | Shared components      |
| `messages/[locale]/*.json`                | Translations           |
| `packages/ui/src/styles/globals.css`      | Global styles & tokens |

---

## Component Patterns

### Break Down Complex Components

```typescript
// ✅ GOOD - Composed components
function MenuPage() {
  return (
    <div>
      <MenuHeader />
      <MenuFilters />
      <MenuGrid />
    </div>
  );
}

// ❌ BAD - 500 lines in one component
function MenuPage() {
  return <div>{/* 500 lines of JSX */}</div>;
}
```

### Extending HTML Element Props

```typescript
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function CustomButton({
  variant = 'primary',
  isLoading,
  children,
  ...rest
}: CustomButtonProps) {
  return <button {...rest}>{isLoading ? 'Loading...' : children}</button>;
}
```

### Code Comments

Code should be self-documenting. Comments explain WHY, not WHAT:

```typescript
// ❌ BAD - Obvious
// Get categories
const categories = await getCategories(storeId);

// ✅ GOOD - Explains WHY
/**
 * HubSpot Forms API requires 500ms delay between submissions
 * @see https://developers.hubspot.com/docs/api/marketing/forms
 */
await delay(500);
```
