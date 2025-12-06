# CLAUDE.md - Restaurant Management System (RMS)

**Imported Documentation:** @../../.claude/CLAUDE-FRONTEND.md

## Overview

- **Port:** 3002
- **Package:** `@app/restaurant-management-system`
- **Purpose:** POS for restaurant staff (menu, tables, orders, kitchen display, reports)
- **Architecture:** Static Site Generation (SSG) for Tauri desktop integration

## Commands

```bash
npm run dev --filter=@app/restaurant-management-system    # Dev (port 3002)
npm run build --workspace=@app/restaurant-management-system  # Static export → out/
npm test --workspace=@app/restaurant-management-system    # Jest tests
```

---

## SSG Architecture (Critical)

RMS uses `output: 'export'` for Tauri desktop bundling. **All pages must be client components.**

### Required Pattern

```typescript
'use client';
import { $api } from '@/utils/apiFetch';
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';

export default function MenuPage() {
  const storeId = useAuthStore(selectSelectedStoreId);
  const { data: response, isLoading } = $api.useQuery(
    'get',
    '/stores/{storeId}/categories',
    { params: { path: { storeId: storeId ?? '' } } },
    { enabled: !!storeId }
  );
  const categories = response?.data ?? [];
  // ...
}
```

### Anti-Patterns

- ❌ `async function Page()` - No server components with data fetching
- ❌ `export const dynamic = 'force-dynamic'` - Breaks static export
- ❌ Middleware - Doesn't run in static export
- ❌ Service functions in `queryFn` - Use `$api` hooks directly

---

## Tablet-First Design (Critical)

**Target:** 10-12" tablets. All UI must be touch-friendly.

### Touch Target Sizes

| Element      | Minimum     | Tailwind         |
| ------------ | ----------- | ---------------- |
| Buttons      | 44px height | `h-11` or larger |
| Icon buttons | 44x44px     | `h-11 w-11`      |
| List items   | 44px height | `min-h-11`       |
| Inputs       | 44px height | `h-11` or `h-12` |

### Key Rules

- **Minimum gap:** `gap-3` (12px) between touchable elements
- **No hover-only UI:** Use `DropdownMenu` for card actions, not `group-hover:opacity-100`
- **Press feedback:** Use `active:scale-95` instead of hover states
- **Grid for menu items:** `min-h-32 p-4` for adequate touch area

### DropdownMenu for Card Actions

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-11 w-11">
      <MoreVertical className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem className="min-h-11">Edit</DropdownMenuItem>
    <DropdownMenuItem className="min-h-11 text-destructive">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## i18n (Client-Side)

- **Locales:** en, zh, my, th (4 languages required)
- **Storage:** Zustand + localStorage (no URL/middleware)
- **Files:** `messages/{locale}/*.json` (16 feature files per locale)

```typescript
import { useLocaleStore, selectLocale } from '@/i18n/locale.store';
const locale = useLocaleStore(selectLocale);
```

---

## Role-Based Access

| Role  | Access                        |
| ----- | ----------------------------- |
| Owner | Full access                   |
| Admin | Menu, tables, orders, kitchen |
| Staff | Sales page only               |

```typescript
const { isLoading } = useProtected({
  allowedRoles: ['OWNER', 'ADMIN'],
  unauthorizedRedirectTo: '/hub/sale',
});
```

---

## Route Structure

```
app/
├── (no-dashboard)/store/choose|create  # Store selection
├── hub/sale/                           # Sales (all roles)
├── hub/(owner-admin)/menu|tables|orders|reports|personnel
├── hub/(chef)/kitchen/
└── admin/                              # Platform admin
```

---

## RMS-Specific Patterns

### API_PATHS Constant Pattern

RMS uses centralized `API_PATHS` for all API route management:

```typescript
// src/utils/api-paths.ts
export const API_PATHS = {
  // RMS-specific routes (staff operations)
  cart: '/api/v1/rms/cart' as const,
  rmsOrders: '/api/v1/rms/orders' as const,
  rmsSession: '/api/v1/rms/sessions/{sessionId}' as const,

  // Shared store routes
  categories: '/api/v1/stores/{storeId}/categories' as const,
  menuItems: '/api/v1/stores/{storeId}/menu-items' as const,
  tables: '/api/v1/stores/{storeId}/tables' as const,

  // Generic routes
  order: '/api/v1/orders/{orderId}' as const,
  recordPayment: '/api/v1/payments/orders/{orderId}' as const,
} as const;

// Usage in components
import { API_PATHS } from '@/utils/api-paths';

const { data } = $api.useQuery('get', API_PATHS.categories, {
  params: { path: { storeId } },
});

const mutation = $api.useMutation('post', API_PATHS.cart);
```

**Rules:**

- ✅ Import from `API_PATHS` - single source of truth
- ✅ Use `as const` for type safety with `$api` hooks
- ❌ Don't hardcode paths in components

### Auth Store Selectors

```typescript
// ✅ Use exported selectors
const storeId = useAuthStore(selectSelectedStoreId);

// ❌ Avoid inline selectors (new function each render)
const storeId = useAuthStore((state) => state.selectedStoreId);
```

### Offline Support

```typescript
import { useNetwork } from '@/utils/network-provider';
const { isOnline } = useNetwork();
```

React Query configured with `networkMode: 'offlineFirst'` and 30-min cache.

### Real-Time Updates

Kitchen display uses Socket.IO for order status updates.

---

## Testing

```typescript
jest.mock('@/utils/apiFetch', () => ({
  $api: {
    useQuery: jest.fn().mockReturnValue({ data: { data: [...] }, isLoading: false }),
    useMutation: jest.fn().mockReturnValue({ mutate: jest.fn(), isPending: false }),
  },
}));
```

- Mock `$api` hooks, not implementation
- Use `screen.getByRole()` over `getByTestId()`

---

## Key Files

| File                                    | Purpose              |
| --------------------------------------- | -------------------- |
| `next.config.js`                        | Static export config |
| `src/utils/apiFetch.ts`                 | API client with auth |
| `src/utils/network-provider.tsx`        | Offline detection    |
| `src/i18n/locale.store.ts`              | Client-side locale   |
| `src/features/auth/store/auth.store.ts` | Auth state           |
