# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important:** This app is part of a Turborepo monorepo. See the root `/CLAUDE.md` for shared conventions, design system, and quality gates that apply across all apps.

## App Overview

**Admin Platform** - Internal platform administration for Origin Food House.

- **Port:** 3003
- **Package name:** `@app/admin-platform`
- **Purpose:** Platform-level administration (store verification, subscription management, platform analytics)
- **Status:** In development

## Commands

```bash
# Development
npm run dev --filter=@app/admin-platform    # Run on port 3003

# Quality checks (no tests in Admin Platform)
npm run lint --filter=@app/admin-platform
npm run check-types --filter=@app/admin-platform
npm run build --filter=@app/admin-platform
```

## Route Structure

```
app/
├── page.tsx              # Root redirect
├── (auth)/
│   ├── login/            # Auth0 login page
│   └── callback/         # Auth0 callback handler
└── (dashboard)/
    ├── layout.tsx        # Dashboard shell (sidebar, header)
    ├── page.tsx          # Dashboard home redirect
    └── dashboard/        # Main dashboard page
```

## Architecture: Server-Side Rendering (SSR)

**Admin Platform uses SSR** - standard Next.js rendering with server components where appropriate.

### Why SSR?

- **Security:** Admin data should not be exposed in client bundles
- **Fresh data:** Platform stats and verification queues always current
- **Standard patterns:** No special constraints like offline or SEO

### Page Patterns

**Protected pages with server data:**

```typescript
// app/(dashboard)/stores/page.tsx
import { getStoresForVerification } from '@/services/adminAPI';
import { StoresPageClient } from './stores-page-client';

// ✅ Server Component - fetch initial data
export default async function StoresPage() {
  const stores = await getStoresForVerification();
  return <StoresPageClient initialStores={stores} />;
}
```

**Client component for interactivity:**

```typescript
// stores-page-client.tsx
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';

interface StoresPageClientProps {
  initialStores: StoreVerificationDto[];
}

export function StoresPageClient({ initialStores }: StoresPageClientProps) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: stores } = useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return fetchStores(token);
    },
    initialData: initialStores,
  });

  const verifyMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const token = await getAccessTokenSilently();
      return verifyStore(storeId, token);
    },
  });

  return <StoresList stores={stores} onVerify={verifyMutation.mutate} />;
}
```

## Folder Structure

**Note:** Admin Platform uses a **flat structure** (not feature-based like RMS) since it's still in early development:

```
src/
├── app/                  # Next.js App Router
├── components/           # Shared components
│   ├── auth/             # Auth0Provider, ProtectedRoute
│   └── layout/           # Header, Sidebar
├── hooks/                # Custom hooks
│   ├── useAuth.ts        # Auth0 hook wrapper
│   ├── useAdmin.ts       # Admin status check
│   └── useAdminAPI.ts    # API hooks for admin operations
├── services/             # API service layer
│   └── adminAPI.ts       # Admin API functions
├── stores/               # Zustand stores
│   └── auth.store.ts     # Auth state
├── types/                # TypeScript types
└── utils/                # Utilities
    ├── cn.ts             # Class name utility
    └── providers.tsx     # React Query provider
```

## Admin-Specific Patterns

### Auth0 React SDK

Unlike RMS (cookie-based auth), Admin Platform uses **Auth0 React SDK**:

```typescript
import { useAuth0 } from '@auth0/auth0-react';

const { isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } =
  useAuth0();
```

**Auth flow:**

1. User visits protected route
2. `ProtectedRoute` checks `isAuthenticated`
3. If not authenticated → redirect to `/login`
4. Login page triggers `loginWithRedirect()`
5. Auth0 handles authentication → callback to `/callback`
6. Callback page handles redirect logic

### No i18n

Admin Platform is **English-only** (no next-intl, no translations):

```typescript
// Direct text in components (no t() function)
<h1>Platform Dashboard</h1>
<Button>Verify Store</Button>
```

### API with Bearer Token

API requests include Auth0 access token:

```typescript
// services/adminAPI.ts
const token = await getAccessTokenSilently();
const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Key Files

| File                                     | Purpose                               |
| ---------------------------------------- | ------------------------------------- |
| `src/components/auth/Auth0Provider.tsx`  | Auth0 context wrapper                 |
| `src/components/auth/ProtectedRoute.tsx` | Route protection component            |
| `src/hooks/useAdminAPI.ts`               | Admin API operations with React Query |
| `src/services/adminAPI.ts`               | Admin API service functions           |
| `src/stores/auth.store.ts`               | Auth state (Zustand)                  |
| `src/utils/providers.tsx`                | React Query provider                  |

## Environment Variables

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=        # Auth0 tenant domain
NEXT_PUBLIC_AUTH0_CLIENT_ID=     # Auth0 application client ID
NEXT_PUBLIC_AUTH0_AUDIENCE=      # Auth0 API audience
NEXT_PUBLIC_API_URL=             # Backend API URL
```

## Development Notes

- **Early stage:** Expect structure to evolve toward feature-based design as more features are added
- **Platform admin only:** This app is for internal use, not customer-facing
- **No tests yet:** Testing infrastructure not set up
