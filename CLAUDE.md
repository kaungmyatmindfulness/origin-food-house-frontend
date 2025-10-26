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
**Styling**: Tailwind CSS v4, Motion, shadcn/ui (52 components)
**Forms**: react-hook-form, Zod, @hookform/resolvers
**i18n**: next-intl (en, zh, my, th)
**Testing (Restaurant Management System)**: Jest, @testing-library/react, jsdom
**Utilities**: lodash-es, qs, sonner, usehooks-ts
**Restaurant Management System-specific**: @auth0/auth0-spa-js, @dnd-kit (drag-drop), qrcode.react, react-to-print, react-dropzone, papaparse (CSV), recharts (charts)
**Self-Ordering System-specific**: socket.io-client (real-time), react-scroll, decimal.js (currency)

## Key Patterns

### 1. Use Existing @repo/ui Components ⭐

**ALWAYS use components from `@repo/ui` before creating new ones.**

The project has 52 production-ready components:

```typescript
// ✅ Use existing components
import { Button, Dialog, Form, Input, Select } from '@repo/ui/components/*';
import { toast } from '@repo/ui/lib/toast';

// ❌ Don't create custom button/input/dialog components
// They already exist in @repo/ui with proper variants!
```

**Available components**: Button, Dialog, Form, Input, Textarea, Select, Checkbox, Switch, RadioGroup, Alert, Card, Accordion, Tabs, Table, Avatar, Badge, Spinner, Skeleton, Toast, Chart, Carousel, Combobox, Command, Drawer, Empty, HoverCard, InputOTP, KBD, Menubar, NavigationMenu, Pagination, Popover, Progress, Resizable, ScrollArea, Sheet, Sidebar, Slider, ToggleGroup, and more.

**Complete list**: accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, confirmation-dialog, context-menu, dialog, drawer, dropdown-menu, empty, form, hover-card, input-otp, input, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip.

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

### 7. Toast Notifications (Sonner) ⭐

**CRITICAL**: Use the correct Sonner API, not the old react-hot-toast pattern.

```typescript
import { toast } from '@repo/ui/lib/toast';

// ✅ CORRECT - Sonner API
toast.success('Order created', {
  description: 'Order #123 has been created successfully',
});

toast.error('Failed to save', {
  description: error.message,
});

toast.info('Session active');
toast.warning('Low stock');

// ❌ WRONG - Old react-hot-toast API (DO NOT USE)
toast({
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive', // ❌ This doesn't exist in Sonner
});
```

**Available Methods**:

- `toast(message)` - Basic toast
- `toast.success(message, options?)` - Success (green)
- `toast.error(message, options?)` - Error (red)
- `toast.warning(message, options?)` - Warning (yellow)
- `toast.info(message, options?)` - Info (blue)
- `toast.promise(promise, options)` - Promise-based toast

**Options Object**:

```typescript
{
  description?: string;  // Additional detail
  action?: {             // Action button
    label: string;
    onClick: () => void;
  };
  duration?: number;     // Auto-dismiss time (ms)
}
```

### 8. Logging & Debugging

**IMPORTANT**: Never use `console.log()` in production code. Use the debug utility (SOS) or structured logging.

```typescript
// Self-Ordering System (SOS)
import { debug } from '@/utils/debug';

debug.log('Cart updated', cart); // Only in dev
debug.warn('Low stock', item); // Only in dev
debug.error('API failed', error); // Always logged

// Restaurant Management System (RMS)
// For debugging, use descriptive console methods:
console.error('Failed to load menu:', error); // Errors only
// Avoid console.log - remove before commit
```

**Rules**:

- ❌ Never commit `console.log()` statements
- ✅ Use `debug.error()` for errors (SOS)
- ✅ Use `console.error()` for errors (RMS)
- ✅ Remove debug logs before production

### 9. Component Event Handlers

**Pattern**: Match callback signatures to component APIs

```typescript
// ✅ CORRECT - Match Radix UI Switch API
const handleToggle = (checked: boolean) => {
  updateStatus(checked);
};

<Switch onCheckedChange={handleToggle} />

// ❌ WRONG - Type mismatch
const handleToggle = (e: React.MouseEvent) => {
  e.stopPropagation();  // ❌ 'e' is actually a boolean!
};

<Switch onCheckedChange={() => handleToggle({} as React.MouseEvent)} />
```

**Common Component Signatures** (Radix UI / shadcn):

- `Switch.onCheckedChange`: `(checked: boolean) => void`
- `Checkbox.onCheckedChange`: `(checked: boolean) => void`
- `RadioGroup.onValueChange`: `(value: string) => void`
- `Select.onValueChange`: `(value: string) => void`
- `Dialog.onOpenChange`: `(open: boolean) => void`

### 10. Skeleton Loading States

```typescript
if (isLoading) return <MenuSkeleton />;
```

Always use skeleton placeholders for non-trivial loading states.

### 11. React Query Configuration

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

### 12. Optimistic Updates Pattern (Self-Ordering System Cart)

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

### 13. WebSocket Integration (Self-Ordering System)

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

### 14. Testing Infrastructure (Restaurant Management System Only)

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

- `toast` - Toast notifications (Sonner)
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

## 🚦 MANDATORY Task Completion Guardrails

**CRITICAL**: Every frontend task MUST pass ALL applicable quality gates before being marked complete. No exceptions.

### Pre-Task Analysis

Before starting any frontend task, determine:

- [ ] **App Scope**: RMS only, SOS only, or Both?
- [ ] **Shared Package**: Does this affect `@repo/ui` or `@repo/api`?
- [ ] **Backend Dependency**: Does this require backend API changes?
- [ ] **Translation Required**: Does this add user-facing text?
- [ ] **Testing Required**: RMS modifications require tests

### Quality Gate Execution Order

#### Frontend Monorepo Level (Run at root)

```bash
cd origin-food-house-frontend

# Step 1: Code Formatting (MUST pass)
npm run format

# Step 2: Linting (MUST pass - 0 warnings)
npm run lint

# Step 3: Type Checking (MUST pass - 0 errors)
npm run check-types

# Step 4: Build (MUST succeed for all apps)
npm run build

# Step 5: API Types (if backend API changed)
npm run generate:api  # Regenerate from OpenAPI spec
```

#### App-Specific Quality Gates

**Restaurant Management System (RMS):**

```bash
cd apps/restaurant-management-system

# 1. Lint (0 warnings)
npm run lint

# 2. Type Check (0 errors)
npm run check-types

# 3. Tests (ALL must pass)
npm test

# 4. Build (must succeed)
npm run build
```

**Self-Ordering System (SOS):**

```bash
cd apps/self-ordering-system

# 1. Lint (0 warnings)
npm run lint

# 2. Type Check (0 errors)
npm run check-types

# 3. Build (must succeed)
npm run build

# ⚠️ Tests: Currently no test infrastructure
# TODO: Add Jest + React Testing Library setup
```

### Task NOT Complete Until

**Code Quality:**

- ✅ All lint warnings resolved (0 warnings)
- ✅ Type checking passes (0 errors)
- ✅ Code is formatted (Prettier)
- ✅ All affected apps build successfully
- ✅ No console errors or warnings

**Testing:**

- ✅ RMS tests pass (if RMS modified)
- ✅ New tests added for new components/features
- ✅ Business logic tested (not just rendering)
- ✅ Edge cases covered

**Architecture & Patterns:**

- ✅ Checked `@repo/ui` before creating components
- ✅ Used auto-generated types from `@repo/api/generated/types`
- ✅ Created query key factories (React Query)
- ✅ Exported selectors for Zustand stores
- ✅ Used `unwrapData()` in services
- ✅ Followed feature-sliced design
- ✅ No hardcoded strings (use constants)

**Internationalization:**

- ✅ Translations added for ALL 4 languages (en, zh, my, th)
- ✅ Translation keys follow naming conventions
- ✅ No hardcoded user-facing text

**Integration:**

- ✅ API types regenerated (if backend changed)
- ✅ No type mismatches with backend
- ✅ Services use correct API endpoints

### When Quality Gates Fail

**If ANY check fails:**

1. ❌ **DO NOT** mark task as complete
2. 🔧 **FIX** the failing check immediately
3. 🔄 **RE-RUN** ALL quality gates from Step 1
4. ✅ **VERIFY** all checks pass before proceeding

**Common Failure Resolutions:**

| Failure             | Resolution                                 |
| ------------------- | ------------------------------------------ |
| Format fails        | Run `npm run format` at monorepo root      |
| Lint warnings       | Fix warnings manually, check ESLint output |
| Type errors         | Fix TypeScript errors, verify imports      |
| Build fails         | Check syntax errors, missing dependencies  |
| Missing types       | Run `npm run generate:api`                 |
| Translation missing | Add to all 4 language files                |

### Automated Verification Script

**Copy-paste this to verify ALL frontend quality gates:**

```bash
#!/bin/bash
set -e  # Exit on first error

echo "🔍 Running Frontend Quality Gates..."

# Monorepo level
echo "📦 Monorepo Quality Gates..."
cd origin-food-house-frontend
npm run format || { echo "❌ Format failed"; exit 1; }
npm run lint || { echo "❌ Lint failed"; exit 1; }
npm run check-types || { echo "❌ Type check failed"; exit 1; }
npm run build || { echo "❌ Build failed"; exit 1; }
echo "✅ Monorepo passed all checks"

# RMS Tests
echo "🧪 RMS Tests..."
cd apps/restaurant-management-system
npm test || { echo "❌ RMS tests failed"; exit 1; }
echo "✅ RMS tests passed"

echo ""
echo "✅✅✅ ALL FRONTEND QUALITY GATES PASSED ✅✅✅"
echo "Task is ready for completion!"
```

### Task Completion Certification

**Before marking ANY frontend task complete, certify:**

```
✅ All quality gate steps passed
✅ Code formatted, linted, type-safe
✅ All affected apps build successfully
✅ RMS tests pass (if RMS modified)
✅ Translations added for all 4 languages (if UI changes)
✅ API types regenerated (if backend changed)
✅ Used @repo/ui components (checked first)
✅ Used auto-generated API types
✅ Created query key factories (if React Query used)
✅ Exported selectors (if Zustand store created)
✅ No hardcoded strings (constants + i18n)
✅ Feature-sliced design followed
✅ Services use unwrapData()
✅ Skeleton loading states implemented

FRONTEND TASK COMPLETION VERIFIED ✅
```

**RULE**: If you cannot certify ALL applicable items above, the task is NOT complete.

## New Feature Checklist

When adding a new feature:

- [ ] **Check `@repo/ui` components first** - don't recreate basics (50+ components available)
- [ ] Create `features/[feature]/` folder following feature-sliced design
- [ ] Use auto-generated types from `@repo/api/generated/types` (never manual types)
- [ ] Add `services/*.service.ts` with JSDoc comments and typed return values
- [ ] Create `queries/*.keys.ts` for hierarchical React Query cache keys
- [ ] Add `store/*.store.ts` with selectors (minimal state only)
- [ ] Add `components/` for feature-specific UI only (not generic components)
- [ ] Use `unwrapData()` in services for consistent error handling
- [ ] Add constants for routes/messages (no magic strings)
- [ ] Add translations to ALL 4 languages (en, zh, my, th)
- [ ] Use skeleton loading states for non-trivial loading
- [ ] Follow naming conventions (see section above)
- [ ] Add tests (RMS: mandatory for common/ components)
- [ ] **Run ALL quality gates** before marking complete

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
- **UI Components**: 52 in @repo/ui
- **Features (RMS)**: 15 (auth, audit-logs, discounts, kitchen, menu, orders, payments, personnel, reports, store, tables, tiers, user)
- **Services**: 17+ across both apps
- **Stores**: 4+ Zustand stores
- **Languages**: 4 (en, zh, my, th)
- **Auto-generated DTOs**: 50+
- **Test Suites**: RMS 10 suites (4 failing, 6 passing) | SOS 0 tests ⚠️
- **Test Count**: RMS 107 tests (100 passing, 7 failing) | SOS 0 tests ⚠️

## ⚠️ Known Issues & Technical Debt

### Critical Issues

#### 1. API Type Mismatch (RMS Build Failing)

**Problem**: Auto-generated types are stale, causing TypeScript errors.

**Affected Files**:

- `apps/restaurant-management-system/src/app/[locale]/hub/(owner-admin)/orders/create/page.tsx`

**Errors**:

```typescript
// CartResponseDto missing fields
Property 'vatAmount' does not exist on type 'CartResponseDto'
Property 'serviceChargeAmount' does not exist on type 'CartResponseDto'
Property 'grandTotal' does not exist on type 'CartResponseDto'

// CartItemResponseDto field mismatches
Property 'menuItem' does not exist. Did you mean 'menuItemId'?
Property 'finalPrice' does not exist on type 'CartItemResponseDto'
```

**Solution**:

```bash
cd origin-food-house-frontend
npm run generate:api  # Regenerate types from backend OpenAPI spec
```

**Prevention**: Always run `npm run generate:api` after backend API changes.

#### 2. Self-Ordering System Has ZERO Tests ⚠️

**Problem**: Customer-facing app with critical real-time features has no automated tests.

**Risk**: High - Cart functionality, WebSocket sync, session management untested.

**Priority**: HIGH

**TODO**:

- Set up Jest + React Testing Library
- Add cart functionality tests
- Add WebSocket sync tests
- Add session management tests
- Target: Minimum 60% coverage for critical paths

### Medium Priority Issues

#### 3. Console Logs in Production Code

**Count**: 81 console.log statements across codebase

**Examples**:

```typescript
// apps/restaurant-management-system/src/features/menu/components/item-card.tsx:61
console.error(`Failed to delete item ${item.id}:`, error);

// apps/restaurant-management-system/src/features/menu/components/item-card.tsx:86
console.error(`Failed to toggle out-of-stock for ${item.id}:`, error);
```

**Solution**: Replace with debug utility or structured logging.

```typescript
// ✅ Better approach
import { debug } from '@/utils/debug'; // SOS only
debug.error('Failed to delete item', { itemId: item.id, error });
```

#### 4. Inconsistent Error Handling

**Problem**: Mix of `unwrapData()` and manual error checking in services.

**Examples**:

```typescript
// ✅ GOOD - Uses unwrapData()
const res = await apiFetch<CategoryResponseDto>('/categories', {...});
return unwrapData(res, 'Failed to create category');

// ❌ INCONSISTENT - Manual check
const res = await apiFetch<MenuItemDto[]>('/menu-items', {...});
if (!res.success) throw new Error(res.message);
return res.data;
```

**Solution**: Standardize on `unwrapData()` pattern across all services.

#### 5. Missing Zustand Middleware (SOS)

**Problem**: SOS Cart and Session stores lack `persist` middleware.

**Risk**: Cart data lost on page refresh, poor UX.

**Affected Stores**:

- `apps/self-ordering-system/src/features/cart/store/cart.store.ts`
- `apps/self-ordering-system/src/features/session/store/session.store.ts`

**Solution**:

```typescript
export const useCartStore = create<CartState & CartActions>()(
  devtools(
    persist(
      // ← Add this
      immer((set) => ({
        // ... state
      })),
      {
        name: 'cart-storage',
        partialize: (state) => ({ cart: state.cart }),
      }
    ),
    { name: 'cart-store' }
  )
);
```

### Low Priority Issues

#### 6. RMS Test Suite Issues

**Status**: 6/10 test suites passing, 4 failing

**Failing Test Suites**:

1. `audit-logs/__tests__/audit-log.service.test.ts` - New feature tests need fixes
2. `dashboard-header.test.tsx` - TextEncoder polyfill issue (known)
3. `tiers/__tests__/tier-usage-widget.test.tsx` - New feature tests need fixes
4. `store/components/settings/__tests__/tax-and-service-tab.test.tsx` - Validation tests failing

**Tests**: 107 total (100 passing, 7 failing)

**TODO**:

- Fix TextEncoder polyfill for dashboard-header test
- Fix new feature tests (audit-logs, tiers, tax-and-service-tab)
- Target: 10/10 test suites passing

#### 7. Type Safety Improvements Needed

**Issue**: Some files have implicit `any` types:

- `apps/restaurant-management-system/src/app/[locale]/hub/(owner-admin)/orders/create/page.tsx:339` - Parameter 'item' implicitly has an 'any' type

**Solution**: Add explicit types:

```typescript
// ❌ BEFORE
const calculateTotal = (item) => item.price * item.quantity;

// ✅ AFTER
const calculateTotal = (item: CartItemResponseDto) =>
  Number(item.finalPrice) * item.quantity;
```

## Recent Additions (October 2025)

### 🆕 New Features

**Restaurant Management System (RMS):**

1. **Audit Logs** (`features/audit-logs/`)
   - Service for fetching audit logs with filters
   - Query key factories for cache management
   - Type definitions for audit log entities
   - Test suite included

2. **Personnel Management** (`features/personnel/`)
   - Staff invitation dialog with role assignment
   - Role change functionality
   - User suspension/activation
   - Personnel service with full CRUD operations
   - Query key factories

3. **Tier System** (`features/tiers/`)
   - Tier gate component for feature access control
   - Tier upgrade dialog with plan comparison
   - Usage widget showing current tier limits
   - Tier service for plan management
   - Test suite for tier usage widget

4. **Enhanced Store Settings** (`features/store/components/settings/`)
   - Tax and service charge configuration tab (with tests)
   - Business hours management tab
   - Loyalty program configuration tab
   - Branding customization tab

### 🔧 Recent Improvements (January 2025)

1. **Toast API Corrected** - Migrated 12 toast calls from old react-hot-toast API to Sonner API
2. **Import Patterns Fixed** - Corrected @repo/api and @repo/ui imports across codebase
3. **Component Event Handlers** - Fixed Switch component event handler type mismatches
4. **Linting Clean** - All 26 ESLint warnings resolved (0 warnings across all packages)
5. **Centralized Toast Export** - Created `@repo/ui/lib/toast` for consistent imports
6. **UI Component Library Expanded** - Now includes 52 production-ready components
7. **New Dependencies Added** - papaparse (CSV), recharts (charts), react-dropzone (file uploads)

## Documentation

- `README.md` - Quick start, overview
- `OPENAPI_SETUP.md` - Type generation setup
- `I18N_GUIDE.md` - Internationalization guide
- `packages/api/README.md` - API package docs
- `apps/restaurant-management-system/README.md` - Restaurant Management System documentation
- `apps/self-ordering-system/README.md` - Self-Ordering System documentation

---

**Origin Food House - Type-Safe, Scalable Architecture**
