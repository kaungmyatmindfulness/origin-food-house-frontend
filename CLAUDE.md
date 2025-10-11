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
│   │   ├── services/     # API service functions
│   │   ├── store/        # Zustand global state
│   │   ├── types/        # TypeScript types
│   │   ├── hooks/        # Custom hooks
│   │   └── components/   # Feature-specific components
│   ├── menu/
│   ├── store/        # Store management (not Zustand)
│   ├── user/
│   └── [feature]/
├── common/           # Shared app utilities
│   ├── components/   # Shared widgets (Header, Sidebar, etc.)
│   ├── services/     # Common API services
│   └── types/        # Shared types (api.types.ts)
└── utils/            # Utility functions (apiFetch.ts)
```

### Key Architectural Patterns

#### 1. Feature Organization

Each feature follows a consistent structure:
- **`services/`**: API calls using `apiFetch` utility
- **`store/`**: Zustand state management (global state only)
- **`types/`**: TypeScript interfaces and types
- **`hooks/`**: Custom React hooks
- **`components/`** or **`ui/`**: Feature-specific UI components

#### 2. API Communication (`apiFetch`)

Located at `src/utils/apiFetch.ts`, this is the central API wrapper:

- **Automatic error handling**: Shows toast notifications for errors
- **Auth integration**: Reads `credentials: 'include'` for httpOnly cookies
- **401 handling**: Automatically clears auth state on unauthorized
- **Query string support**: Uses `qs` library for complex query parameters
- **Custom error classes**: `ApiError`, `UnauthorizedError`, `NetworkError`
- **Typed responses**: Returns `StandardApiResponse<T>` from `common/types/api.types.ts`

**Usage pattern:**
```typescript
// In service files
export async function getMenuItem(id: string) {
  const response = await apiFetch<MenuItem>(`/menu-items/${id}`);
  return response.data;
}

// With query parameters
export async function searchItems(query: string) {
  const response = await apiFetch<MenuItem[]>({
    path: '/menu-items',
    query: { search: query, status: 'active' }
  });
  return response.data;
}
```

#### 3. State Management (Zustand)

- **Global state only**: Used for auth, selected store, user data
- **Middleware stack**: `devtools` → `persist` → `immer`
- **Persistent auth**: Uses localStorage via `persist` middleware
- **No API calls in stores**: Keep stores pure, call services from components

**Example pattern:**
```typescript
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        // state and actions
      })),
      { name: 'auth-storage' }
    ),
    { name: 'auth-store' }
  )
);
```

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

**POS-specific:**
- @dnd-kit (drag and drop for menu reordering)
- qrcode.react (QR code generation)
- react-to-print (receipt printing)

**SOS-specific:**
- socket.io-client (real-time cart sync)
- react-scroll (menu navigation)
- decimal.js (precise currency calculations)

### Shared UI Package (@repo/ui)

Located in `packages/ui/`, this package exports:

- **Components**: shadcn/ui components (Button, Dialog, Form, etc.)
- **Hooks**: React hooks
- **Utilities**: `cn()` utility via `lib/utils.ts`
- **Styles**: `globals.css` with Tailwind configuration

**Import pattern:**
```typescript
import { Button } from '@repo/ui/components/button';
import { useToast } from '@repo/ui/hooks/use-toast';
```

## Important Development Rules

### 1. API Service Pattern

**Services should:**
- Live in `features/[feature]/services/`
- Use `apiFetch` for all HTTP calls
- Return only `response.data` (errors are thrown automatically)
- Be strongly typed with TypeScript

**Example:**
```typescript
// ✅ Correct
export async function createCategory(data: CreateCategoryDto) {
  const response = await apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data; // Only return data
}

// ❌ Incorrect - don't handle errors manually
export async function createCategory(data: CreateCategoryDto) {
  try {
    const response = await apiFetch<Category>(...);
    if (response.status === 'error') {
      // Don't do this - apiFetch handles it
    }
  } catch (error) {
    // Don't do this - apiFetch already shows toast
  }
}
```

### 2. Zustand Store Pattern

**Stores should:**
- Contain minimal global state
- Use immer for immutable updates
- Export selector functions
- Persist only necessary data
- Never contain API logic

**Example:**
```typescript
// ✅ Correct - pure state management
export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        selectedStoreId: null,
        setSelectedStore: (id) => set((draft) => {
          draft.selectedStoreId = id;
        }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ selectedStoreId: state.selectedStoreId })
      }
    )
  )
);

// Export selectors
export const selectSelectedStoreId = (state: AuthState) => state.selectedStoreId;
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

### React Query with apiFetch

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCategories, createCategory } from '@/features/menu/services/category.service';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['categories', storeId],
  queryFn: () => getCategories(storeId),
});

// Mutation
const mutation = useMutation({
  mutationFn: createCategory,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  },
});
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

| Feature | POS (@app/pos) | SOS (@app/sos) |
|---------|---------------|---------------|
| **Port** | 3002 | 3001 |
| **Users** | Restaurant staff | Customers |
| **Auth** | Required (cookie-based) | Optional (session-based) |
| **Real-time** | Not used | Socket.IO for cart sync |
| **Key Features** | Menu management, table QR codes, store settings | Menu browsing, cart, order placement |
| **Route Groups** | `(no-dashboard)`, `hub/`, `(owner-admin)` | `restaurants/[slug]`, `tables/[id]` |

## Technical Documentation Reference

Detailed technical documentation for the POS app is available at `apps/pos/README.md`, which includes:
- Detailed folder structure explanations
- In-depth API patterns
- Skeleton UI usage examples
- Step-by-step implementation guides

Refer to this document for comprehensive implementation examples and best practices specific to the POS system.
