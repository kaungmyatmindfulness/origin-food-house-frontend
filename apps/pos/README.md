# Origin Food House - POS Application

**Point of Sale System** for restaurant staff to manage menus, tables, orders, and store settings.

**Port:** 3002
**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, React Query, Tailwind CSS

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Internationalization](#internationalization)
8. [Development Patterns](#development-patterns)
9. [Component Examples](#component-examples)

---

## Overview

The POS app is designed for restaurant staff to manage daily operations including menu items, categories, table management, and store settings. It features role-based access control with three roles: Owner, Admin, and Staff.

### User Roles

| Role      | Permissions                       |
| --------- | --------------------------------- |
| **Owner** | Full access to all features       |
| **Admin** | Manage menu, tables, view reports |
| **Staff** | Process sales, view menu          |

---

## Features

### ✅ Authentication

- Cookie-based authentication (httpOnly cookies)
- Auto-redirect on unauthorized access
- Protected routes with `useProtected` hook
- Role-based page restrictions

### ✅ Menu Management

- Create, edit, delete menu items and categories
- Drag-and-drop reordering
- Image upload support
- Customization groups and options
- Availability toggling

### ✅ Table Management

- Create and manage tables
- Generate QR codes for each table
- Download QR codes for printing
- Table status tracking

### ✅ Store Management

- Store information editing
- Multi-store support
- Store selection interface
- Settings configuration

### ✅ Internationalization

- Support for 4 languages (EN, ZH, MY, TH)
- Language switcher component
- Type-safe translations
- Cookie-based locale persistence

---

## Architecture

### Folder Structure

```
apps/pos/src/
├── app/                          # Next.js 15 App Router
│   ├── (no-dashboard)/          # Public routes (login, register, store selection)
│   ├── hub/                     # Protected dashboard routes
│   │   ├── sale/                # Sales processing
│   │   ├── profile/             # User profile
│   │   └── (owner-admin)/       # Owner/Admin only routes
│   │       ├── menu/            # Menu management
│   │       ├── tables/          # Table management
│   │       └── store/           # Store settings
│   ├── layout.tsx               # Root layout with i18n
│   └── page.tsx                 # Landing page
│
├── features/                     # Feature-based modules
│   ├── auth/
│   │   ├── components/          # Auth UI components
│   │   ├── hooks/               # useProtected hook
│   │   ├── queries/             # Query key factories
│   │   ├── services/            # Auth API calls
│   │   ├── store/               # Auth Zustand store
│   │   └── types/               # Auth TypeScript types
│   ├── menu/
│   │   ├── components/          # Menu UI (CategoryCard, ItemModal, etc.)
│   │   ├── queries/             # menuKeys factory
│   │   ├── services/            # category.service.ts, menu-item.service.ts
│   │   ├── store/               # Menu UI state
│   │   └── types/               # Menu types
│   ├── tables/
│   ├── store/                   # Store feature (not Zustand)
│   └── user/
│
├── common/                       # Shared app utilities
│   ├── components/              # LanguageSwitcher, widgets
│   ├── constants/               # ROUTES, ERROR_MESSAGES
│   ├── hooks/                   # useDialog, useDialogState
│   ├── services/                # Upload service
│   └── types/                   # Shared types
│
├── utils/                        # Utilities
│   ├── apiFetch.ts              # Configured API client
│   └── providers.tsx            # React Query provider
│
├── i18n/                         # Localization
│   ├── config.ts                # Locale configuration
│   └── request.ts               # next-intl setup
│
└── middleware.ts                 # Locale detection

messages/                         # Translation files (root level)
├── en.json
├── zh.json
├── my.json
└── th.json
```

---

## Getting Started

### 1. Install Dependencies

From monorepo root:

```bash
npm install
```

### 2. Environment Variables

Create `apps/pos/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
# From root
npm run dev --filter=@app/pos

# Or from apps/pos directory
npm run dev
```

Visit [http://localhost:3002](http://localhost:3002)

### 4. Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # TypeScript type checking
```

---

## API Integration

### Using apiFetch Utility

**Location:** `src/utils/apiFetch.ts`

The app uses a configured API client from `@repo/api`:

```typescript
import { apiFetch, unwrapData } from '@/utils/apiFetch';

// Simple GET request
const categories = await apiFetch<Category[]>({
  path: '/categories',
  query: { storeId },
});

// POST request
const newCategory = await apiFetch<Category>('/categories', {
  method: 'POST',
  body: JSON.stringify(data),
});

// With unwrapData helper
export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}
```

### Key Features

- ✅ Automatic error handling (toast notifications)
- ✅ Auth integration (httpOnly cookie-based)
- ✅ 401 handling (clears auth state automatically)
- ✅ Query string support with `qs` library
- ✅ Custom error classes
- ✅ Type-safe responses

### Service Pattern

**Location:** `features/[feature]/services/*.service.ts`

```typescript
// features/menu/services/category.service.ts
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { Category } from '../types/category.types';

export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}

export async function createCategory(
  storeId: string,
  data: CreateCategoryDto
): Promise<Category> {
  const res = await apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return unwrapData(res, 'Failed to create category');
}
```

**Rules:**

- ✅ Return only data (not full response)
- ✅ Use proper return types (not `unknown`)
- ✅ Use `unwrapData()` for null checking
- ✅ Add JSDoc comments
- ✅ Throw errors for invalid responses

---

## State Management

### Zustand Stores

**Purpose:** Minimal global state only

**Example:** `features/auth/store/auth.store.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AuthState {
  selectedStoreId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setSelectedStore: (storeId: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        selectedStoreId: null,
        isAuthenticated: false,

        setSelectedStore: (storeId) =>
          set((draft) => {
            draft.selectedStoreId = storeId;
          }),

        setAuthenticated: (isAuth) =>
          set((draft) => {
            draft.isAuthenticated = isAuth;
            if (!isAuth) draft.selectedStoreId = null;
          }),

        clearAuth: () =>
          set((draft) => {
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          selectedStoreId: state.selectedStoreId,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Export selectors for performance
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
```

**Middleware Stack:**

- `immer` - Immutable updates with mutable syntax
- `persist` - localStorage persistence
- `devtools` - Redux DevTools integration

**Best Practices:**

- ✅ Keep stores minimal (auth, UI state only)
- ✅ No API calls in stores
- ✅ Export selectors for each state field
- ✅ Use `immer` for nested updates
- ✅ Persist only necessary data

---

## Internationalization

### Configuration

**Location:** `src/i18n/config.ts`

```typescript
export const locales = ['en', 'zh', 'my', 'th'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
```

### Usage in Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  const tMenu = useTranslations('menu');

  return (
    <div>
      <h1>{t('home')}</h1>
      <button>{tMenu('createItem')}</button>
    </div>
  );
}
```

### Adding the Language Switcher

```typescript
import { LanguageSwitcher } from '@/common/components/LanguageSwitcher';

<Header>
  <LanguageSwitcher />
</Header>
```

See **`../../I18N_GUIDE.md`** for complete documentation.

---

## Development Patterns

### 1. Protected Routes

Use the `useProtected` hook for authentication:

```typescript
import { useProtected } from '@/features/auth/hooks/useProtected';

export default function AdminPage() {
  const { isLoading } = useProtected({
    allowedRoles: ['OWNER', 'ADMIN'],
    unauthorizedRedirectTo: '/hub/sale',
  });

  if (isLoading) return <PageSkeleton />;

  return <PageContent />;
}
```

### 2. React Query with Query Keys

Use query key factories for type safety:

```typescript
import { useQuery } from '@tanstack/react-query';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { getCategories } from '@/features/menu/services/category.service';

const { data: categories, isLoading } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
  enabled: !!storeId,
});
```

### 3. Dialog State Management

Use custom hook for cleaner dialog management:

```typescript
import { useDialog } from '@/common/hooks/useDialogState';

const [dialogOpen, setDialogOpen] = useDialog();

<Button onClick={() => setDialogOpen(true)}>Open</Button>
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  ...
</Dialog>
```

### 4. Constants Usage

Never hardcode routes or error messages:

```typescript
import { ROUTES, ERROR_MESSAGES } from '@/common/constants/routes';

// Routes
router.push(ROUTES.MENU);

// Error messages
toast.error(ERROR_MESSAGES.AUTH.PERMISSION_DENIED);
```

### 5. Skeleton Loading States

**Always** show skeleton placeholders for non-trivial data:

```typescript
import { MenuSkeleton } from '@/features/menu/components/menu-skeleton';

if (isLoading) {
  return <MenuSkeleton />;
}

return <MenuList data={data} />;
```

---

## Component Examples

### Page Component with All Patterns

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useDialog } from '@/common/hooks/useDialogState';
import { useAuthStore, selectSelectedStoreId } from '@/features/auth/store/auth.store';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { getCategories } from '@/features/menu/services/category.service';
import { MenuSkeleton } from '@/features/menu/components/menu-skeleton';

export default function MenuPage() {
  const t = useTranslations('menu');
  const [dialogOpen, setDialogOpen] = useDialog();

  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: menuKeys.categories(selectedStoreId!),
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const handleCreate = useCallback(() => {
    setDialogOpen(true);
  }, [setDialogOpen]);

  if (isLoading) return <MenuSkeleton />;

  return (
    <div>
      <h1>{t('title')}</h1>
      <button onClick={handleCreate}>{t('createItem')}</button>
      {/* Rest of component */}
    </div>
  );
}
```

---

## API Response Types

All API responses follow this structure:

```typescript
interface StandardApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message: string | null;
  errors: ErrorDetail[] | null;
}

interface ErrorDetail {
  code?: string;
  message: string;
  field?: string | null;
}
```

Services return only the `data` field, throwing errors for failures.

---

## Query Key Factories

**Location:** `features/[feature]/queries/*.keys.ts`

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,
  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,
  items: (storeId: string) => [...menuKeys.all, 'items', { storeId }] as const,
};

// features/auth/queries/auth.keys.ts
export const authKeys = {
  all: ['auth'] as const,
  currentUser: (storeId?: string) =>
    storeId
      ? ([...authKeys.all, 'currentUser', { storeId }] as const)
      : ([...authKeys.all, 'currentUser'] as const),
};
```

**Benefits:**

- Type-safe query keys
- Easy cache invalidation
- Prevents typos
- Consistent structure

---

## Common Hooks

### `useProtected`

**Location:** `features/auth/hooks/useProtected.ts`

Protects routes and handles authorization:

```typescript
const { isLoading } = useProtected({
  allowedRoles: ['OWNER', 'ADMIN'],
  loginRedirectTo: '/login',
  unauthorizedRedirectTo: '/hub/sale',
});
```

### `useDialog`

**Location:** `common/hooks/useDialogState.ts`

Manages dialog open/close state:

```typescript
const [isOpen, setIsOpen] = useDialog();

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  ...
</Dialog>
```

---

## Constants

### Routes

**Location:** `common/constants/routes.ts`

```typescript
export const ROUTES = {
  LOGIN: '/login',
  STORE_CHOOSE: '/store/choose',
  MENU: '/hub/menu',
  TABLES_MANAGE: '/hub/tables/manage',
  // ...
} as const;
```

### Error Messages

```typescript
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: 'Unauthorized',
    PERMISSION_DENIED: 'Permission Denied.',
    // ...
  },
} as const;
```

---

## Translation Keys

**Available Namespaces:**

- `common` - UI elements (save, cancel, edit, etc.)
- `auth` - Authentication (login, register)
- `menu` - Menu management
- `tables` - Table management
- `store` - Store settings
- `errors` - Error messages

**Example:**

```typescript
const t = useTranslations('menu');

t('title'); // "Menu Management" (EN) / "菜单管理" (ZH)
t('createItem'); // "Create Menu Item" / "创建菜品"
```

---

## Code Quality Rules

### ✅ DO

- Use `apiFetch` for all HTTP requests
- Return typed data from services
- Use `unwrapData()` for null checking
- Export selectors from stores
- Use query key factories
- Add JSDoc to service functions
- Use skeleton loading states
- Memoize callbacks with `useCallback`
- Extract constants (routes, messages)
- Add translations for all 4 languages

### ❌ DON'T

- Return `unknown` from services
- Hardcode routes or error messages
- Mix API calls with UI components
- Use `console.log` in production code
- Skip skeleton loading states
- Forget to add selectors to stores
- Use magic strings for query keys

---

## File Naming Conventions

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Queries    | `*.keys.ts`    | `menu.keys.ts`        |
| Hooks      | `use*.ts`      | `useProtected.ts`     |
| Components | PascalCase     | `CategoryCard.tsx`    |

---

## Testing

```bash
# Type checking
npm run check-types

# Linting
npm run lint

# Build test
npm run build
```

---

## Deployment

### Production Build

```bash
npm run build --filter=@app/pos
npm run start --filter=@app/pos
```

### Environment Variables

Ensure `NEXT_PUBLIC_API_URL` is set for production environment.

---

## Troubleshooting

### TypeScript Errors

```bash
npm run check-types --workspace=@app/pos
```

### Build Failures

```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### i18n Not Working

1. Check translation files exist: `messages/en.json`, etc.
2. Verify middleware is configured: `src/middleware.ts`
3. Check locale cookie in DevTools

---

## Learn More

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

## Related Documentation

- **`../../README.md`** - Monorepo overview
- **`../../CLAUDE.md`** - Project guidelines
- **`../../I18N_GUIDE.md`** - i18n complete guide

---

**POS Application - Origin Food House**
Version 0.1.0
