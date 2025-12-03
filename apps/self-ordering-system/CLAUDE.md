# CLAUDE.md - Self-Ordering System (SOS)

This file provides SOS-specific guidance.

**Imported Documentation:**

@../../.claude/CLAUDE-FRONTEND.md

## App Overview

**Self-Ordering System (SOS)** - Customer-facing app for scanning QR codes and ordering food.

- **Port:** 3001
- **Package name:** `@app/self-ordering-system`
- **Purpose:** Customers scan table QR codes, browse menus, customize items, and place orders
- **Auth:** None (guest ordering via session tokens)

## Architecture: Server-Side Rendering (SSR)

**SOS uses SSR** - pages can fetch data on the server for faster initial load and better SEO (menu pages can be indexed).

### Why SSR?

- **SEO-friendly:** Menu pages can be crawled by search engines
- **Fast first paint:** Server-rendered HTML shows content immediately
- **Dynamic data:** Menu items and prices always up-to-date
- **Mobile performance:** Less JavaScript to parse on low-end phones

### Page Patterns

**Server Component (default) - for initial data:**

```typescript
// app/[locale]/restaurants/[slug]/menu/page.tsx
import { getMenuItems } from '@/features/menu/services/menu.service';
import { getStoreBySlug } from '@/features/store/services/store.service';
import { MenuPageClient } from './menu-page-client';

interface MenuPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

// ✅ Server Component - fetches data on server
export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;

  // Server-side data fetching
  const [store, menuItems] = await Promise.all([
    getStoreBySlug(slug),
    getMenuItems(slug),
  ]);

  // Pass to client component for interactivity
  return <MenuPageClient store={store} initialMenuItems={menuItems} />;
}
```

**Client Component - for interactivity:**

```typescript
// menu-page-client.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/features/cart/store/cart.store';

interface MenuPageClientProps {
  store: StoreResponseDto;
  initialMenuItems: MenuItemResponseDto[];
}

export function MenuPageClient({ store, initialMenuItems }: MenuPageClientProps) {
  // ✅ Hydrate with server data, enable real-time updates
  const { data: menuItems } = useQuery({
    queryKey: ['menu', store.id],
    queryFn: () => getMenuItems(store.slug),
    initialData: initialMenuItems,  // SSR data as initial
    staleTime: 30 * 1000,           // Refetch after 30s
  });

  const addToCart = useCartStore((state) => state.addItem);

  return <MenuGrid items={menuItems} onAddToCart={addToCart} />;
}
```

### Hybrid Pattern: Server + Client

```typescript
// ✅ CORRECT - Server fetches, client handles interaction
// Server Component (page.tsx)
export default async function Page() {
  const data = await fetchData();  // Runs on server
  return <ClientComponent initialData={data} />;
}

// Client Component
'use client';
export function ClientComponent({ initialData }) {
  const [data, setData] = useState(initialData);
  // Interactive features here
}
```

## Commands

See root `/CLAUDE.md` for full command reference. SOS-specific commands:

```bash
# Development
npm run dev --filter=@app/self-ordering-system    # Run on port 3001

# Build
npm run build --filter=@app/self-ordering-system
```

**Note:** SOS has no tests. Use monorepo-wide quality gates from root.

## Route Structure

```
app/[locale]/
├── page.tsx                       # Landing page
├── tables/[id]/join/              # QR code entry point - joins table session
└── restaurants/[slug]/menu/       # Menu browsing page
```

**User Flow:**

1. Customer scans QR code → `/tables/[tableId]/join`
2. Session created → Redirects to `/restaurants/[slug]/menu`
3. Browse menu, add to cart, place order
4. Cart syncs in real-time across devices at same table

## Features

| Feature | Location            | Description                                    |
| ------- | ------------------- | ---------------------------------------------- |
| cart    | `features/cart/`    | Cart state, WebSocket sync, add/remove items   |
| menu    | `features/menu/`    | Menu display, item cards, customization dialog |
| session | `features/session/` | Table session management, token storage        |
| store   | `features/store/`   | Store info fetching                            |

## SOS-Specific Patterns

### No Authentication

SOS doesn't use user authentication. Instead, it uses **session tokens** to associate carts with tables:

```typescript
// Session store manages table/cart association
import { useSessionStore } from '@/features/session/store/session.store';

const sessionToken = useSessionStore((state) => state.sessionToken);
```

### Real-Time Cart Sync

Multiple devices at the same table share a cart via Socket.IO:

```typescript
// WebSocket events for cart synchronization
// See: features/cart/config/ws-events.ts
```

When one customer adds an item, all devices at the table see the update immediately.

### API Client (No Auth Headers)

Unlike RMS, SOS's `apiFetch` doesn't include auth handling:

```typescript
// src/utils/apiFetch.ts - simpler than RMS
export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  // No onUnauthorized handler - guests don't authenticate
});
```

### Translation Files

SOS uses single translation files per locale (simpler than RMS's split files):

```
messages/
├── en.json    # All translations in one file
├── zh.json
├── my.json
└── th.json
```

## Key Files

| File                            | Purpose                          |
| ------------------------------- | -------------------------------- |
| `src/utils/apiFetch.ts`         | API client (no auth)             |
| `src/utils/socket-provider.tsx` | Socket.IO provider for cart sync |
| `src/features/cart/store/`      | Cart state with real-time sync   |
| `src/features/session/store/`   | Session token management         |
| `src/middleware.ts`             | Locale detection (cookie-based)  |

## Design Considerations

- **Mobile-first:** Primary use case is customers on phones
- **Guest UX:** No login required, minimal friction
- **Shared tables:** Multiple customers at same table see same cart
- **Menu-centric:** Focus on browsing and customization UI
