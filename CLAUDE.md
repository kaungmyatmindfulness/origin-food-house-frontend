# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Turborepo monorepo** for Origin Food House, a restaurant management system with two Next.js 15 applications:

- **`@app/pos`** (port 3002): Point of Sale system for restaurant staff
- **`@app/sos`** (port 3001): Self-Ordering System for customers

Both apps share a common UI component library (`@repo/ui`) and configuration packages.

## Development Commands

### Root-level commands (using Turborepo)

```bash
# Install dependencies
npm install

# Run all apps in development mode
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint

# Type-check all apps
npm run check-types

# Format code
npm run format

# Generate TypeScript types from backend OpenAPI spec
npm run generate:api
```

### App-specific commands

Navigate to the app directory or use Turborepo filtering:

```bash
# Run only POS app
cd apps/pos && npm run dev
# or
turbo run dev --filter=@app/pos

# Run only SOS app
cd apps/sos && npm run dev
# or
turbo run dev --filter=@app/sos
```

**Individual app scripts:**

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Lint with ESLint (max 0 warnings)
- `npm run check-types` - TypeScript type checking

## Architecture Overview

### Monorepo Structure

```
apps/
├── pos/              # Restaurant POS system (@app/pos)
└── sos/              # Customer self-ordering system (@app/sos)
packages/
├── api/              # Shared API utilities & types (@repo/api) ⭐ NEW
├── ui/               # Shared UI components (@repo/ui)
├── eslint-config/    # Shared ESLint configuration
└── typescript-config/ # Shared TypeScript configuration
```

### App Architecture (POS & SOS)

Both apps follow a **feature-sliced architecture** with the following structure:

```
src/
├── app/              # Next.js 15 App Router (pages, layouts, routes)
├── features/         # Feature-based modules (domain logic)
│   ├── auth/
│   │   ├── components/   # Feature-specific UI components
│   │   ├── hooks/        # Custom hooks (useProtected)
│   │   ├── queries/      # Query key factories ⭐ NEW
│   │   ├── services/     # API service functions
│   │   ├── store/        # Zustand global state
│   │   └── types/        # TypeScript types
│   ├── menu/
│   ├── store/        # Store management (not Zustand)
│   ├── user/
│   └── [feature]/
├── common/           # Shared app utilities
│   ├── components/   # Shared widgets (LanguageSwitcher, etc.) ⭐
│   ├── constants/    # Routes, error messages ⭐ NEW
│   ├── hooks/        # Reusable hooks (useDialog) ⭐ NEW
│   ├── services/     # Common API services
│   └── types/        # Shared types
├── utils/            # Utility functions
│   ├── apiFetch.ts   # Configured API client
│   └── debug.ts      # Debug utility (SOS) ⭐ NEW
├── i18n/             # Localization config ⭐ NEW
│   ├── config.ts
│   └── request.ts
└── middleware.ts     # Locale detection ⭐ NEW

messages/             # Translation files (root level) ⭐ NEW
├── en.json           # English
├── zh.json           # Chinese (中文)
├── my.json           # Myanmar (မြန်မာ)
└── th.json           # Thai (ไทย)
```

### Key Architectural Patterns

#### 1. Shared API Package (@repo/api) ⭐ WITH OPENAPI CODE GENERATION

**NEW:** Centralized API utilities with **auto-generated TypeScript types** from backend OpenAPI spec.

**Located at:** `packages/api/`

**Exports:**

- `createApiFetch(config)` - Factory for configurable API client
- `unwrapData(response, errorMsg)` - Null-safe data extraction
- **Auto-generated TypeScript types** from `@repo/api/generated/types` ⭐ NEW
- Error classes: `ApiError`, `UnauthorizedError`, `NetworkError`, `FetchError`
- Types: `StandardApiResponse<T>`, `ErrorDetail`, `UploadImageResponseData`
- `createUploadService(apiFetch)` - Upload service factory

**Type Generation:**

```bash
# Regenerate types when backend API changes (backend must be running)
npm run generate:api
```

**Key Features:**

- ✅ **50+ auto-generated DTOs** from backend OpenAPI specification
- ✅ Single source of truth (backend spec → frontend types)
- ✅ Zero manual type maintenance
- ✅ Catch API mismatches at compile time
- ✅ Full IDE auto-completion support

**Usage in apps:**

```typescript
// apps/pos/src/utils/apiFetch.ts
import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  onUnauthorized: () => useAuthStore.getState().clearAuth(),
});

export { unwrapData };
```

**Using Generated Types in Services:**

```typescript
// features/menu/services/category.service.ts
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types'; // ✅ Auto-generated types

export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
  const res = await apiFetch<CategoryResponseDto[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}
```

**Available Generated Types:**

- `CategoryResponseDto`, `CreateCategoryDto`, `UpdateCategoryDto`
- `MenuItemResponseDto`, `CreateMenuItemDto`, `UpdateMenuItemDto`
- `UserProfileResponseDto`, `CreateUserDto`
- `TableResponseDto`, `CreateTableDto`, `BatchUpsertTableDto`
- `CartResponseDto`, `CartItemResponseDto`, `AddItemToCartDto`
- `GetStoreDetailsResponseDto`, `CreateStoreDto`, `UpdateStoreInformationDto`
- And 40+ more DTOs...

**Documentation:**

- See **`OPENAPI_SETUP.md`** for complete setup guide
- See **`packages/api/README.md`** for detailed API package documentation

#### 2. Feature Organization

Each feature follows a consistent structure:

- **`components/`**: Feature-specific UI components (always use this name, not `ui/`)
- **`queries/`**: React Query key factories (e.g., `menu.keys.ts`)
- **`services/`**: API calls using `apiFetch` utility
- **`store/`**: Zustand state management (global state only, always singular)
- **`types/`**: TypeScript interfaces and types
- **`hooks/`**: Custom React hooks

#### 3. API Communication (`apiFetch`)

**Located at:** `src/utils/apiFetch.ts` (configured instance)
**Core implementation:** `packages/api/src/utils/apiFetch.ts`

**Features:**

- **Automatic error handling**: Shows toast notifications for errors
- **Auth integration**: Reads `credentials: 'include'` for httpOnly cookies (POS only)
- **401 handling**: Automatically clears auth state on unauthorized (POS only)
- **Query string support**: Uses `qs` library for complex query parameters
- **Custom error classes**: `ApiError`, `UnauthorizedError`, `NetworkError`
- **Typed responses**: Returns `StandardApiResponse<T>` from `@repo/api/types/api.types`

**Usage pattern with unwrapData helper:**

```typescript
// In service files
import { apiFetch, unwrapData } from '@/utils/apiFetch';

export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}

// For mutations
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

#### 4. State Management (Zustand)

- **Global state only**: Used for auth, selected store, user data
- **Middleware stack**: `devtools` → `persist` → `immer`
- **Persistent auth**: Uses localStorage via `persist` middleware
- **No API calls in stores**: Keep stores pure, call services from components
- **MUST export selectors**: For performance and consistency

**Example pattern:**

```typescript
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

        clearAuth: () =>
          set((draft) => {
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),
      { name: 'auth-storage' }
    ),
    { name: 'auth-store' }
  )
);

// ✅ ALWAYS export selectors
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
```

#### 5. Query Key Factories ⭐ NEW

**IMPORTANT:** Always use query key factories for React Query to ensure type safety and consistency.

**Location:** `features/[feature]/queries/*.keys.ts`

**Pattern:**

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,
  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,
  items: (storeId: string) => [...menuKeys.all, 'items', { storeId }] as const,
  item: (storeId: string, itemId: string) =>
    [...menuKeys.items(storeId), itemId] as const,
};

// Usage in components
import { menuKeys } from '@/features/menu/queries/menu.keys';

const { data } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});

// Cache invalidation
queryClient.invalidateQueries({ queryKey: menuKeys.all });
```

**Benefits:**

- Type-safe query keys
- Easy cache invalidation
- Prevents typos
- Hierarchical structure

#### 6. Constants & Configuration ⭐ NEW

**NEVER hardcode routes or error messages.** Use constants.

**Location:** `common/constants/routes.ts`

```typescript
export const ROUTES = {
  LOGIN: '/login',
  STORE_CHOOSE: '/store/choose',
  MENU: '/hub/menu',
  // ...
} as const;

export const ERROR_MESSAGES = {
  AUTH: {
    PERMISSION_DENIED: 'Permission Denied.',
    INVALID_SESSION: 'Invalid session data. Please log in again.',
    // ...
  },
} as const;

// Usage
import { ROUTES, ERROR_MESSAGES } from '@/common/constants/routes';

router.push(ROUTES.MENU);
toast.error(ERROR_MESSAGES.AUTH.PERMISSION_DENIED);
```

#### 7. Internationalization (i18n) ⭐ NEW

Both apps support 4 languages: English (en), Chinese (zh), Myanmar (my), Thai (th).

**Setup:**

- Middleware: `src/middleware.ts`
- Config: `src/i18n/config.ts`
- Translation files: `messages/{locale}.json`
- Language switcher: `common/components/LanguageSwitcher.tsx`

**Usage:**

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  const tMenu = useTranslations('menu');

  return (
    <>
      <h1>{t('home')}</h1>
      <button>{tMenu('createItem')}</button>
    </>
  );
}
```

**Rules:**

- ✅ Extract ALL user-facing text to translation files
- ✅ Add translations to ALL 4 language files simultaneously
- ✅ Use descriptive keys (`menu.createItem`, not `m.ci`)
- ❌ Never hardcode text in components

#### 4. Loading States (Skeleton UI)

**CRITICAL RULE**: Always use skeleton placeholders for loading states unless the data is trivial.

- Prevents layout shifts
- Improves perceived performance
- Consistent UX across apps

**Pattern:**

```typescript
if (isLoading) {
  return <StoreListSkeleton />;
}
```

#### 5. Route Organization (Next.js App Router)

**POS app routes:**

- `(no-dashboard)/` - Routes without dashboard layout (login, register, store selection)
- `hub/` - Main dashboard routes
- `hub/(owner-admin)/` - Routes restricted to owners/admins

**SOS app routes:**

- `restaurants/[slug]/menu/` - Restaurant menu page
- `tables/[id]/join/` - Table joining flow

### Technology Stack

**Framework & Core:**

- Next.js 15 (App Router)
- React 19
- TypeScript 5.8+

**State Management:**

- Zustand with immer, persist, devtools middleware
- React Query (@tanstack/react-query) for server state

**Styling:**

- Tailwind CSS v4 (@tailwindcss/postcss)
- Motion (framer-motion alternative) for animations
- shadcn/ui components via `@repo/ui`

**Forms & Validation:**

- react-hook-form
- Zod (via @repo/ui)
- @hookform/resolvers

**Utilities:**

- lodash-es
- qs (query string parsing)
- sonner (toast notifications)
- usehooks-ts
- next-intl (internationalization) ⭐ NEW

**POS-specific:**

- @dnd-kit (drag and drop for menu reordering)
- qrcode.react (QR code generation)
- react-to-print (receipt printing)

**SOS-specific:**

- socket.io-client (real-time cart sync)
- react-scroll (menu navigation)
- decimal.js (precise currency calculations)

### Shared Packages

#### @repo/api ⭐ WITH OPENAPI CODE GENERATION

Located in `packages/api/`, this package provides shared API utilities and **auto-generated types**:

- **`src/generated/`**: Auto-generated TypeScript types from OpenAPI spec ⭐ NEW
  - `types.gen.ts` - All DTOs and response types (50+)
  - `sdk.gen.ts` - Generated SDK (not used directly)
  - `index.ts` - Main export
- **`utils/apiFetch.ts`**: Core API client factory
- **`types/api.types.ts`**: `StandardApiResponse`, `ErrorDetail`
- **`types/upload.types.ts`**: Upload-related types
- **`services/upload.service.ts`**: Upload service factory

**Import patterns:**

```typescript
// API utilities
import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';
import type { StandardApiResponse } from '@repo/api/types/api.types';

// Auto-generated types ⭐ NEW
import type {
  CategoryResponseDto,
  MenuItemResponseDto,
  UserProfileResponseDto,
} from '@repo/api/generated/types';
```

**Code Generation Setup:**

- Uses `@hey-api/openapi-ts` for type generation
- Fetches spec from `http://localhost:3000/api-docs-json`
- Automatically fixes common OpenAPI spec issues
- Generates 50+ DTOs and response types
- See `OPENAPI_SETUP.md` for complete documentation

#### @repo/ui

Located in `packages/ui/`, this package exports:

- **Components**: 40+ shadcn/ui components (Button, Dialog, Form, etc.)
- **Hooks**: React hooks (use-toast, use-mobile)
- **Utilities**: `cn()` utility via `lib/utils.ts`
- **Styles**: `globals.css` with Tailwind configuration

**Import pattern:**

```typescript
import { Button } from '@repo/ui/components/button';
import { useToast } from '@repo/ui/hooks/use-toast';
```

## Important Development Rules

### 1. API Service Pattern ⭐ UPDATED WITH AUTO-GENERATED TYPES

**Services should:**

- Live in `features/[feature]/services/`
- Use `apiFetch` from `@/utils/apiFetch.ts`
- **Use auto-generated types from `@repo/api/generated/types`** ⭐ NEW
- Use `unwrapData()` helper for null checking
- Return properly typed data (NEVER `unknown`)
- Add JSDoc comments

**Example:**

```typescript
// ✅ Correct - Modern pattern with auto-generated types + unwrapData
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types'; // ✅ Use generated types

/**
 * Creates a new category for a specific store.
 *
 * @param storeId - The ID of the store.
 * @param data - The category data to create.
 * @returns A promise resolving to the created Category object.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function createCategory(
  storeId: string,
  data: CreateCategoryDto
): Promise<CategoryResponseDto> {
  const res = await apiFetch<CategoryResponseDto>('/categories', {
    method: 'POST',
    query: { storeId },
    body: JSON.stringify(data),
  });

  return unwrapData(res, 'Failed to create category');
}

// ❌ Incorrect - don't use manual types when generated types exist
import type { Category } from '../types/category.types'; // Don't do this
// Always use: import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ Incorrect - don't handle errors manually
export async function createCategory(data: CreateCategoryDto) {
  try {
    const response = await apiFetch<CategoryResponseDto>(...);
    if (response.status === 'error') {
      // Don't do this - apiFetch handles it
    }
  } catch (error) {
    // Don't do this - apiFetch already shows toast
  }
}

// ❌ Incorrect - don't return unknown
export async function createCategory(...): Promise<unknown> {
  // Always use proper types
}

// ❌ Incorrect - manual null checking
if (res.data == null) {
  throw new Error('...');
}
return res.data;
// Use unwrapData() instead
```

**Benefits of Auto-Generated Types:**

- ✅ Always in sync with backend API
- ✅ Catch breaking changes at compile time
- ✅ No manual type maintenance
- ✅ Full IDE auto-completion
- ✅ Single source of truth (backend → frontend)

### 2. Zustand Store Pattern ⭐ UPDATED

**Stores should:**

- Contain minimal global state
- Use immer for immutable updates
- **MUST export selector functions** (for every state field)
- Persist only necessary data
- Never contain API logic

**Example:**

```typescript
// ✅ Correct - pure state management with selectors
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        selectedStoreId: null,
        isAuthenticated: false,

        setSelectedStore: (id) =>
          set((draft) => {
            draft.selectedStoreId = id;
          }),

        clearAuth: () =>
          set((draft) => {
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ selectedStoreId: state.selectedStoreId }),
      }
    ),
    { name: 'auth-store' }
  )
);

// ✅ MUST export selectors for all state fields
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
```

### 3. Component Organization

**Client components (`'use client'`):**

- Required for: interactivity, hooks, event handlers, browser APIs
- Use for: forms, interactive UI, state management
- Keep minimal - extract server-renderable parts

**Server components (default):**

- Use for: static content, data fetching, layouts
- Cannot use: useState, useEffect, event handlers

### 4. Type Safety

**All code must:**

- Use `.ts` or `.tsx` extensions
- Define explicit types for API responses
- Use type imports when importing types
- Avoid `any` - use `unknown` if type is truly unknown

**Pattern:**

```typescript
// ✅ Correct
import type { Category } from '@/features/menu/types/category.types';

// ✅ Correct - explicit return type
export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch<Category[]>('/categories');
  return response.data;
}
```

### 5. Skeleton UI Enforcement

**Always show skeleton placeholders during loading states** for non-trivial data.

**Pattern:**

```tsx
'use client';

export default function MenuPage() {
  const { data, isLoading } = useQuery(['menu'], fetchMenu);

  if (isLoading) {
    return <MenuSkeleton />; // ✅ Always show skeleton
  }

  return <MenuContent data={data} />;
}
```

### 6. Authentication Flow

**POS app uses cookie-based authentication:**

- Access tokens stored in httpOnly cookies (not localStorage)
- `apiFetch` uses `credentials: 'include'` for cookies
- Auth store only tracks `isAuthenticated` flag and `selectedStoreId`
- 401 responses automatically clear auth state via `clearAuth()`

**Protected routes pattern:**

```typescript
// Use useProtected hook
const { user, isLoading } = useProtected();

if (isLoading) return <LoadingSkeleton />;
```

### 7. Error Handling

**Let apiFetch handle errors:**

- Toast notifications shown automatically
- Custom error classes for different scenarios
- 401 errors clear auth automatically
- Don't wrap apiFetch in try/catch unless you need custom handling

## Common Patterns

### React Query with Query Key Factories ⭐ UPDATED

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import {
  getCategories,
  createCategory,
} from '@/features/menu/services/category.service';

// ✅ Use query key factories
const { data, isLoading } = useQuery({
  queryKey: menuKeys.categories(storeId), // Type-safe
  queryFn: () => getCategories(storeId),
});

// ✅ Mutation with query key factory
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createCategory,
  onSuccess: () => {
    // Invalidate using query key factory
    queryClient.invalidateQueries({ queryKey: menuKeys.all });
  },
});
```

### Custom Hooks for Common Patterns ⭐ NEW

```typescript
// Dialog state management
import { useDialog } from '@/common/hooks/useDialogState';

const [dialogOpen, setDialogOpen] = useDialog();

<Button onClick={() => setDialogOpen(true)}>Open</Button>
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  ...
</Dialog>
```

### Debug Utility (SOS App) ⭐ NEW

```typescript
import { debug } from '@/utils/debug';

// Only logs in development, silent in production
debug.log('Cart updated:', cart);
debug.warn('Item not found');

// Always logs (even in production)
debug.error('Critical error:', error);
```

### Form Handling with react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

### Accessing Shared UI Components

```typescript
import { Button } from '@repo/ui/components/button';
import { Dialog } from '@repo/ui/components/dialog';
import { Form } from '@repo/ui/components/form';
```

## Environment Variables

**Required for both apps:**

- `NEXT_PUBLIC_API_URL` - Backend API base URL

**Note:** Only `NEXT_PUBLIC_*` variables are exposed to the client. Keep sensitive keys server-side.

## Key Differences Between POS and SOS

| Feature          | POS (@app/pos)                                  | SOS (@app/sos)                       |
| ---------------- | ----------------------------------------------- | ------------------------------------ |
| **Port**         | 3002                                            | 3001                                 |
| **Users**        | Restaurant staff                                | Customers                            |
| **Auth**         | Required (cookie-based)                         | Optional (session-based)             |
| **Real-time**    | Not used                                        | Socket.IO for cart sync              |
| **Key Features** | Menu management, table QR codes, store settings | Menu browsing, cart, order placement |
| **Route Groups** | `(no-dashboard)`, `hub/`, `(owner-admin)`       | `restaurants/[slug]`, `tables/[id]`  |

## Naming Conventions & File Organization ⭐ CRITICAL

### File Naming Rules

| Type       | Convention     | ✅ Correct            | ❌ Incorrect           |
| ---------- | -------------- | --------------------- | ---------------------- |
| Services   | `*.service.ts` | `category.service.ts` | `category.services.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       | `authStore.ts`         |
| Types      | `*.types.ts`   | `menu-item.types.ts`  | `menuItem.types.ts`    |
| Query Keys | `*.keys.ts`    | `menu.keys.ts`        | `menuKeys.ts`          |
| Hooks      | `use*.ts`      | `useProtected.ts`     | `protected.hook.ts`    |
| Components | PascalCase.tsx | `CategoryCard.tsx`    | `category-card.tsx`    |

### Folder Naming Rules

| Purpose     | ✅ Correct          | ❌ Incorrect       |
| ----------- | ------------------- | ------------------ |
| Feature UI  | `components/`       | `ui/`              |
| State store | `store/` (singular) | `stores/` (plural) |
| Services    | `services/`         | `service/`         |
| Types       | `types/`            | `type/`            |

### Import Organization

```typescript
// ✅ Correct order
'use client';

// 1. React & Next.js
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

// 3. Shared packages
import { Button } from '@repo/ui/components/button';

// 4. Features (grouped)
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { getCategories } from '@/features/menu/services/category.service';

// 5. Common utilities
import { useDialog } from '@/common/hooks/useDialogState';
import { ROUTES } from '@/common/constants/routes';

// 6. Types (last, with 'type' import)
// Prefer auto-generated types from @repo/api/generated/types
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

## Custom Hooks Library ⭐ NEW

### POS App Hooks

**Location:** `common/hooks/`

- **`useDialog()`** - Dialog state management
- **`useDialogState()`** - Alternative dialog hook with separate handlers
- **`useProtected()`** - Route protection & authorization

**Location:** `features/auth/hooks/`

- **`useProtected(options)`** - Comprehensive auth & role checking

### SOS App Hooks

**Location:** `features/cart/hooks/`

- **`useCartSocketListener()`** - Real-time cart synchronization

## Debug & Logging ⭐ NEW

**SOS App Only:** `utils/debug.ts`

```typescript
import { debug } from '@/utils/debug';

// Development only (NODE_ENV === 'development')
debug.log('Info message');
debug.warn('Warning message');
debug.info('Info message');

// Always logged (production & development)
debug.error('Error message');
```

**POS App:**

- Use regular `console.log` for now (consider adding debug utility)

## Technical Documentation Reference

### Quick Reference

- **`README.md`** - Monorepo overview, quick start, tech stack
- **`CLAUDE.md`** (this file) - Development guidelines & patterns
- **`OPENAPI_SETUP.md`** - OpenAPI TypeScript code generation guide ⭐ NEW
- **`I18N_GUIDE.md`** - Complete internationalization guide
- **`packages/api/README.md`** - API package usage documentation
- **`apps/pos/README.md`** - POS app detailed documentation
- **`apps/sos/README.md`** - SOS app detailed documentation

### Detailed Documentation

Detailed technical documentation includes:

- Folder structure explanations
- In-depth API patterns with examples
- Skeleton UI usage
- State management patterns
- Internationalization setup
- Query key factory usage
- Custom hooks documentation

---

## Summary Checklist for New Features

When adding a new feature, ensure you:

- [ ] Create feature folder: `features/[feature]/`
- [ ] **Use auto-generated types from `@repo/api/generated/types`** ⭐ NEW
- [ ] Add `services/*.service.ts` with proper return types
- [ ] Add `types/*.types.ts` only for non-API types (use generated types for API)
- [ ] Create `queries/*.keys.ts` if using React Query
- [ ] Add `store/*.store.ts` if global state is needed
- [ ] Export selectors for all store fields
- [ ] Add `components/` for feature UI
- [ ] Use `unwrapData()` in services
- [ ] Add JSDoc to all service functions
- [ ] Create constants for routes/messages if needed
- [ ] Add translations to ALL 4 language files
- [ ] Use skeleton loading states
- [ ] Follow naming conventions
- [ ] Use query key factories for React Query
- [ ] **Regenerate types after backend API changes** (`npm run generate:api`) ⭐ NEW

---

## 🚨 Before Completing ANY Task

**ALWAYS run these commands to ensure code quality:**

```bash
# Type checking (must pass with 0 errors)
npm run check-types

# Linting (must pass with 0 warnings)
npm run lint

# Code formatting
npm run format
```

**Do not consider a task complete until all checks pass.**

---

## Code Quality & Build System

### ESM Module Resolution with OpenAPI Code Generation

The project uses TypeScript's `NodeNext` module resolution for proper ESM support. This requires explicit `.js` extensions in imports, even for `.ts` files.

**Post-Generation Script**: `packages/api/scripts/fix-imports.js`

This Node.js script automatically fixes generated OpenAPI code after running `npm run generate:api`:

- Adds `.js` extensions to all relative imports
- Fixes incorrect import paths (e.g., `./client.js` → `./client/index.js`)
- Runs automatically as part of the generation pipeline

**Integration**:

```bash
# packages/api/scripts/fetch-and-generate.sh
openapi-ts
node "$SCRIPT_DIR/fix-imports.js"  # Auto-fixes imports
```

**Why This is Necessary**: The `@hey-api/openapi-ts` generator doesn't add `.js` extensions to imports, which TypeScript requires with `moduleResolution: NodeNext`. This post-processing step ensures generated code passes type checks without manual intervention.

### Environment Variables

**Declared in `turbo.json`**:

```json
{
  "globalEnv": ["NODE_ENV"]
}
```

This tells Turborepo that `NODE_ENV` is an allowable environment variable, preventing lint warnings from `turbo/no-undeclared-env-vars`.

### Build Quality Gates

Before merging any code, ensure all quality checks pass:

```bash
npm run check-types  # ✅ 0 errors
npm run lint         # ✅ 0 warnings
npm run format       # ✅ Code formatted
```

**Current Status**: ✅ All checks passing (as of last update)

---

**Origin Food House - Clean, Type-Safe, Scalable Architecture**
