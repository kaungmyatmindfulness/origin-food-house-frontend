# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Turborepo monorepo for Origin Food House restaurant management system with two Next.js 15 apps:

- **`@app/restaurant-management-system`** (port 3002): Point of Sale for staff
- **`@app/self-ordering-system`** (port 3001): Self-Ordering System for customers

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Run all apps (POS: 3002, SOS: 3001)
npm run build            # Build all apps
npm run lint             # Lint (max 0 warnings)
npm run check-types      # Type check (0 errors)
npm run format           # Format code
npm run generate:api     # Generate types from OpenAPI spec

# Restaurant Management System-specific
cd apps/restaurant-management-system && npm test              # Run Jest tests
cd apps/restaurant-management-system && npm run test:watch    # Watch mode
cd apps/restaurant-management-system && npm run test:coverage # Coverage report

# App-specific dev
turbo run dev --filter=@app/restaurant-management-system
turbo run dev --filter=@app/self-ordering-system
```

## Architecture

### Structure

```
apps/
├── restaurant-management-system/  # Restaurant Management System
└── self-ordering-system/          # Customer ordering
packages/
├── api/              # Shared API utilities + auto-generated types
├── ui/               # Shared UI components (shadcn/ui)
├── eslint-config/
└── typescript-config/
```

### App Structure (Feature-Sliced)

```
src/
├── app/              # Next.js App Router
├── features/         # Domain logic
│   └── [feature]/
│       ├── components/   # Feature UI
│       ├── hooks/        # Custom hooks
│       ├── queries/      # Query key factories
│       ├── services/     # API calls
│       ├── store/        # Zustand state
│       └── types/        # Types
├── common/           # Shared utilities
│   ├── components/   # Shared widgets
│   ├── constants/    # Routes, messages
│   ├── hooks/        # Reusable hooks
│   └── services/
├── utils/            # Utilities (apiFetch, debug)
├── i18n/             # Localization
└── middleware.ts
```

## Tech Stack

**Core**: Next.js 15 (Turbopack), React 19, TypeScript 5.8+
**State**: Zustand (persist, immer, devtools), React Query (@tanstack/react-query)
**Styling**: Tailwind CSS v4, Motion, shadcn/ui (50+ components)
**Forms**: react-hook-form, Zod, @hookform/resolvers
**i18n**: next-intl (en, zh, my, th)
**Testing (Restaurant Management System)**: Jest, @testing-library/react, jsdom
**Utilities**: lodash-es, qs, sonner, usehooks-ts
**Restaurant Management System-specific**: @auth0/auth0-spa-js, @dnd-kit (drag-drop), qrcode.react, react-to-print, react-dropzone
**Self-Ordering System-specific**: socket.io-client (real-time), react-scroll, decimal.js (currency)

## Key Patterns

### 1. Use Existing @repo/ui Components ⭐

**ALWAYS use components from `@repo/ui` before creating new ones.**

The project has 50+ production-ready components:

```typescript
// ✅ Use existing components
import { Button, Dialog, Form, Input, Select } from '@repo/ui/components/*';
import { useToast } from '@repo/ui/hooks/use-toast';

// ❌ Don't create custom button/input/dialog components
// They already exist in @repo/ui with proper variants!
```

**Available components**: Button, Dialog, Form, Input, Textarea, Select, Checkbox, Switch, RadioGroup, Alert, Card, Accordion, Tabs, Table, Avatar, Badge, Spinner, Skeleton, Toast, and 30+ more.

**Before creating a component**:

1. Check `packages/ui/src/components/` directory
2. Import from `@repo/ui/components/[name]`
3. Use size variants (sm, default, lg) when available
4. Only create custom components for feature-specific, complex UI

### 2. Auto-Generated API Types ⭐

**Always use auto-generated types from OpenAPI spec:**

```typescript
// ✅ Use generated types
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';

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
```

**Features:**

- 50+ auto-generated DTOs from backend
- Single source of truth
- Compile-time type safety
- Run `npm run generate:api` when backend changes

### 3. Query Key Factories

**Reference**: [TkDodo's Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,

  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,

  category: (storeId: string, categoryId: string) =>
    [...menuKeys.categories(storeId), categoryId] as const,

  items: (storeId: string) => [...menuKeys.all, 'items', { storeId }] as const,

  item: (storeId: string, itemId: string) =>
    [...menuKeys.items(storeId), itemId] as const,
};

// Usage in components
const { data } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});

// Cache invalidation (hierarchical)
queryClient.invalidateQueries({ queryKey: menuKeys.all }); // All menu
queryClient.invalidateQueries({ queryKey: menuKeys.categories(storeId) }); // Specific
```

**Benefits**: Type-safe, hierarchical invalidation, prevents typos

### 4. Zustand Stores

**Pattern**: devtools → persist → immer

```typescript
// Define initial state separately for clarity
const initialState: AuthState = {
  selectedStoreId: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

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

// ✅ MUST export selectors
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
```

**Rules**:

- Define `initialState` separately
- Use `partialize` to control what gets persisted
- Middleware order: devtools → persist → immer
- Always export selectors for all state fields

### 5. Constants (Never Hardcode)

```typescript
// common/constants/routes.ts
export const ROUTES = {
  LOGIN: '/login',
  MENU: '/hub/menu',
} as const;

export const ERROR_MESSAGES = {
  AUTH: { PERMISSION_DENIED: 'Permission Denied.' },
} as const;
```

### 6. Internationalization

```typescript
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('home')}</h1>;
}
```

**Rules:**

- Extract ALL user-facing text
- Add to ALL 4 language files (en, zh, my, th)
- Use descriptive keys

### 7. Skeleton Loading States

```typescript
if (isLoading) return <MenuSkeleton />;
```

Always use skeleton placeholders for non-trivial loading states.

### 8. React Query Configuration

**Default settings in providers.tsx**:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

**Server-side handling**: Separate query client instances for server/browser to prevent hydration issues.

### 9. Optimistic Updates Pattern (Self-Ordering System Cart)

For real-time feel with WebSocket sync:

```typescript
// In store
optimisticAddItem: async (cartItem) => {
  const originalCart = get().cart;
  const tempId = `temp-${Date.now()}`;

  // 1. Update UI immediately
  set((state) => {
    state.cart.items.push({ ...cartItem, id: tempId });
  });

  try {
    // 2. Call API
    await addItemToCart(payload);
  } catch (error) {
    // 3. Rollback on error
    set((state) => {
      state.cart = originalCart;
    });
    throw error;
  }
  // 4. Final state from WebSocket 'cart:updated' event
};
```

**Pattern**: Optimistic update → API call → Rollback on error → WebSocket confirmation

### 10. WebSocket Integration (Self-Ordering System)

**Setup**: SocketProvider in utils/socket-provider.tsx

```typescript
const socket = io(WS_URL, {
  withCredentials: true, // For httpOnly cookies
  transports: ['websocket'], // Explicit transport
});

// Usage
const { socket, isConnected } = useSocket();

socket?.on('cart:updated', (cart) => {
  useCartStore.getState().setCart(cart);
});
```

**Events**: `connect`, `disconnect`, `connect_error`, `error`, `cart:updated`

### 11. Testing Infrastructure (Restaurant Management System Only)

**Setup**: Jest + @testing-library/react + jsdom

```typescript
// jest.config.ts
{
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
}
```

**Testing Pattern**:

- Mock Zustand stores with jest.mock
- Mock Next.js components (Image, Link)
- Use @testing-library/react for component testing
- Focus on rendering, interactions, accessibility

**Run tests**: `npm test` (in apps/restaurant-management-system directory)

## Critical Rules

### API Services

- Live in `features/[feature]/services/`
- Use `apiFetch` + `unwrapData`
- Use auto-generated types from `@repo/api/generated/types`
- Add JSDoc comments
- Return typed data (never `unknown`)

### Zustand Stores

- Minimal global state only
- Use immer for updates
- **Must export selectors**
- Never contain API logic
- Persist only necessary data

### Component Organization

- **Client** (`'use client'`): hooks, events, interactivity
- **Server** (default): static content, layouts

### Type Safety

- Use `.ts`/`.tsx` extensions
- Explicit types for API responses
- Type imports: `import type { ... }`
- Avoid `any`, use `unknown` if needed

### Authentication & Authorization

**Restaurant Management System App**:

- Cookie-based auth with httpOnly cookies
- Auth0 SSO integration (@auth0/auth0-spa-js)
- `useProtected()` hook for route protection with role-based access control
- 401 auto-clears auth state and redirects to login
- 403 shows permission denied and redirects

**useProtected Hook Features**:

- Role-based authorization (`allowedRoles` option)
- Custom redirect paths
- Error handling (401, 403, missing session)
- Loading states for smooth UX

**Self-Ordering System App**:

- Session-based auth with cookies
- No Auth0 (simpler flow for customers)
- WebSocket auth via `withCredentials: true`

## Naming Conventions

### Files

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Query Keys | `*.keys.ts`    | `menu.keys.ts`        |
| Hooks      | `use*.ts`      | `useProtected.ts`     |
| Components | PascalCase.tsx | `CategoryCard.tsx`    |

### Folders

- Feature UI: `components/` (not `ui/`)
- State: `store/` (singular, not `stores/`)
- Services: `services/`
- Types: `types/`

### Import Order

```typescript
'use client';

// 1. React & Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';

// 3. Shared packages
import { Button } from '@repo/ui/components/button';

// 4. Features
import { useAuthStore } from '@/features/auth/store/auth.store';

// 5. Common
import { ROUTES } from '@/common/constants/routes';

// 6. Types (last)
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

## Restaurant Management System vs Self-Ordering System

| Feature      | Restaurant Management System              | Self-Ordering System                |
| ------------ | ----------------------------------------- | ----------------------------------- |
| Port         | 3002                                      | 3001                                |
| Users        | Staff                                     | Customers                           |
| Auth         | Auth0 SSO + cookies                       | Session-based cookies               |
| Real-time    | None                                      | Socket.IO (cart sync)               |
| Testing      | Jest + Testing Library                    | None (manual testing)               |
| Key Features | Menu mgmt, QR codes, store settings       | Menu browse, cart, ordering         |
| Routes       | `(no-dashboard)`, `hub/`, `(owner-admin)` | `restaurants/[slug]`, `tables/[id]` |
| Env Vars     | 6 (API, Customer URL, Auth0 x5)           | 1 (API URL)                         |

## Environment Variables

**Restaurant Management System App** (.env.example):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CUSTOMER_APP_URL=http://localhost:3001

# Auth0 SSO
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.origin-food-house.com
NEXT_PUBLIC_AUTH0_REDIRECT_URI=http://localhost:3002/auth/callback
```

**Self-Ordering System App** (.env.example):

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
# Note: NEXT_PUBLIC_WS_URL defaults to http://localhost:3001 (in code)
```

**Important**: Only `NEXT_PUBLIC_*` variables are exposed to the client.

## Custom Hooks Reference

**Restaurant Management System App**:

- `useProtected(options?)` - Auth/role-based route protection (`features/auth/hooks/`)
- `useDialogState(initial?)` - Dialog state with open/close/toggle (`common/hooks/`)
- `useDialog(initial?)` - Simpler dialog state with setter (`common/hooks/`)

**Self-Ordering System App**:

- `useSocket()` - WebSocket connection access (from SocketProvider)
- `useCartSocketListener()` - Real-time cart sync (`features/cart/hooks/`)
- `useStickyHeader()` - Sticky menu header (`features/menu/hooks/`)

**Shared (@repo/ui)**:

- `useToast()` - Toast notifications
- `useMobile()` - Mobile breakpoint detection

## Utility Functions

**Formatting** (`utils/formatting.ts`):

```typescript
formatCurrency(value, currency?, locale?) // Intl.NumberFormat with fallback
// Default: THB, th-TH locale
```

**Debug** (Self-Ordering System only, `utils/debug.ts`):

```typescript
debug.log(); // Dev only
debug.warn(); // Dev only
debug.error(); // Always logged
```

## New Feature Checklist

- [ ] Check `@repo/ui` components first - don't recreate basics
- [ ] Create `features/[feature]/` folder
- [ ] Use auto-generated types from `@repo/api/generated/types`
- [ ] Add `services/*.service.ts` with JSDoc
- [ ] Create `queries/*.keys.ts` for React Query
- [ ] Add `store/*.store.ts` with selectors (if needed)
- [ ] Add `components/` for feature-specific UI only
- [ ] Use `unwrapData()` in services
- [ ] Add constants for routes/messages
- [ ] Add translations to ALL 4 languages
- [ ] Use skeleton loading states
- [ ] Follow naming conventions
- [ ] Add tests (Restaurant Management System) if component is in common/

## Quality Gates

**Before completing ANY task:**

```bash
npm run check-types  # ✅ 0 errors
npm run lint         # ✅ 0 warnings
npm run format       # ✅ Code formatted
```

**Task is not complete until all checks pass.**

## Build System & Configuration

### Turborepo Setup

- **UI**: Terminal UI (`"ui": "tui"`)
- **Global Env**: `NODE_ENV` declared in turbo.json
- **Task Dependencies**: `^build`, `^lint`, `^check-types` (runs dependencies first)
- **Dev Mode**: `cache: false, persistent: true`

### TypeScript Configuration

- **Module Resolution**: `NodeNext` (requires `.js` extensions)
- **Path Aliases**: `@/*` → `./src/*`
- **Extends**: `@repo/typescript-config/nextjs.json`
- **Post-generation**: `fix-imports.js` auto-fixes OpenAPI imports

### Next.js Configuration

- **Turbopack**: Enabled for dev mode
- **Plugins**: next-intl for i18n
- **Middleware**: Locale detection (never prefix URLs)

## Advanced Patterns

### Form Composition with react-hook-form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@repo/ui/components/form';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  price: z.number().positive(),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0 },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Drag & Drop with @dnd-kit (Restaurant Management System)

Used in menu reordering. Pattern:

- `DndContext` from `@dnd-kit/core`
- `SortableContext` from `@dnd-kit/sortable`
- `useSortable` hook for items
- `arrayMove` utility for reordering

### Server/Browser Query Client Pattern

```typescript
// utils/providers.tsx
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient(); // New client per request
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient; // Reuse in browser
  }
}
```

Prevents query client recreation during React suspense.

## Project Statistics

- **Apps**: 2 (Restaurant Management System, Self-Ordering System)
- **Shared Packages**: 4 (api, ui, eslint-config, typescript-config)
- **UI Components**: 50+ in @repo/ui
- **Services**: 14 across both apps
- **Stores**: 4 Zustand stores
- **Languages**: 4 (en, zh, my, th)
- **Auto-generated DTOs**: 50+

## Documentation

- `README.md` - Quick start, overview
- `OPENAPI_SETUP.md` - Type generation setup
- `I18N_GUIDE.md` - Internationalization guide
- `packages/api/README.md` - API package docs
- `apps/restaurant-management-system/README.md` - Restaurant Management System documentation
- `apps/self-ordering-system/README.md` - Self-Ordering System documentation

---

**Origin Food House - Type-Safe, Scalable Architecture**
