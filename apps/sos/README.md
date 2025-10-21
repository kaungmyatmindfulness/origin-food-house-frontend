# Origin Food House - Self-Ordering System (SOS)

**Customer-facing ordering system** for browsing menus, managing cart, and placing orders via table QR codes.

**Port:** 3001
**Tech Stack:** Next.js 15, React 19, TypeScript, Zustand, Socket.IO, Decimal.js

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Real-Time Features](#real-time-features)
6. [State Management](#state-management)
7. [Internationalization](#internationalization)
8. [Development Patterns](#development-patterns)

---

## Overview

The SOS (Self-Ordering System) app allows customers to scan a table QR code, browse the restaurant menu, add items to their cart, and place orders. All cart operations are synchronized in real-time across devices via WebSocket.

### User Flow

1. **Scan QR Code** → Join table session
2. **Browse Menu** → View categories and items
3. **Add to Cart** → Real-time cart updates
4. **Checkout** → Place order
5. **Track Order** → View order status

---

## Features

### ✅ Menu Browsing

- Browse menu categories
- View item details with images
- See customization options
- Check item availability
- Smooth scroll navigation

### ✅ Real-Time Cart

- Socket.IO-based synchronization
- Optimistic UI updates
- Rollback on errors
- Multi-device cart sync
- Session-based cart persistence

### ✅ Table Sessions

- QR code table joining
- Session management
- Table information display
- Session expiration handling

### ✅ Order Management

- Cart quantity management
- Special instructions per item
- Order summary
- Checkout flow

### ✅ Internationalization

- 4 languages (EN, ZH, MY, TH)
- Language switcher
- Type-safe translations
- Cookie-based locale

---

## Architecture

### Folder Structure

```
apps/sos/src/
├── app/                          # Next.js 15 App Router
│   ├── restaurants/
│   │   └── [slug]/
│   │       └── menu/            # Restaurant menu page
│   ├── tables/
│   │   └── [id]/
│   │       └── join/            # Table joining flow
│   ├── layout.tsx               # Root layout with i18n
│   └── page.tsx                 # Landing page
│
├── features/                     # Feature-based modules
│   ├── cart/
│   │   ├── components/          # Cart UI components
│   │   ├── config/              # Cart configuration
│   │   ├── hooks/               # useCartSocketListener
│   │   ├── services/            # Cart API calls
│   │   ├── store/               # Cart Zustand store (with optimistic updates)
│   │   └── types/               # Cart types
│   ├── menu/
│   │   ├── components/          # Menu browsing UI
│   │   ├── hooks/               # Menu-specific hooks
│   │   ├── services/            # Menu API calls
│   │   ├── store/               # Menu UI state
│   │   └── types/               # Menu types
│   ├── session/
│   │   ├── services/            # Session API calls
│   │   ├── store/               # Session state
│   │   └── types/               # Session types
│   └── order/
│       └── store/               # Order state
│
├── common/                       # Shared utilities
│   ├── components/              # LanguageSwitcher
│   └── services/                # Upload service
│
├── utils/                        # Utilities
│   ├── apiFetch.ts              # Configured API client
│   ├── debug.ts                 # Debug utility
│   ├── providers.tsx            # React Query provider
│   └── socket-provider.tsx      # Socket.IO provider
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

Create `apps/sos/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
# From root
npm run dev --filter=@app/sos

# Or from apps/sos directory
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### 4. Available Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # TypeScript type checking
```

---

## Real-Time Features

### Socket.IO Integration

**Location:** `utils/socket-provider.tsx`

The app uses Socket.IO for real-time cart synchronization across devices.

### Cart Store with Optimistic Updates

**Location:** `features/cart/store/cart.store.ts`

```typescript
import { useCartStore } from '@/features/cart/store/cart.store';

// Optimistic add item
await optimisticAddItem({
  menuItem: item,
  quantity: 1,
  selectedOptions: [],
  notes: null,
});

// Updates UI immediately, then calls API
// Final state synced via WebSocket 'cart:updated' event
```

**Pattern:**

1. Update UI optimistically
2. Call API in background
3. Rollback on error
4. WebSocket broadcasts final state

### Cart Socket Listener

**Location:** `features/cart/hooks/index.ts`

```typescript
export const useCartSocketListener = () => {
  const { socket, isConnected } = useSocket();
  const { setCart, setError } = useCartStore();

  useEffect(() => {
    if (socket && isConnected) {
      socket.on('cart:updated', (cart) => setCart(cart));
      socket.on('cart:error', (error) => setError(error.message));

      return () => {
        socket.off('cart:updated');
        socket.off('cart:error');
      };
    }
  }, [socket, isConnected]);
};
```

---

## State Management

### Cart Store (with Optimistic Updates)

```typescript
interface CartState {
  cart: Cart | null;
  error: string | null;
}

interface CartActions {
  setCart: (cart: Cart | null) => void;
  setError: (error: string | null) => void;
  clearCartState: () => void;
  optimisticAddItem: (item: OptimisticAddCartItem) => Promise<void>;
  optimisticUpdateItem: (item: CartItem) => Promise<void>;
  optimisticRemoveItem: (itemId: string) => Promise<void>;
  optimisticClearCart: () => Promise<void>;
}

// Selectors
export const selectCart = (state: CartState) => state.cart;
export const selectCartItems = (state: CartState) => state.cart?.items ?? [];
export const selectCartItemCount = (state: CartState) =>
  state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
export const selectCartError = (state: CartState) => state.error;
```

### Session Store

```typescript
interface SessionInfoState {
  sessionId: string | null;
  tableId: string | null;
  storeId: string | null;
}

// Selectors
export const selectSessionId = (state: SessionInfoState) => state.sessionId;
export const selectTableId = (state: SessionInfoState) => state.tableId;
export const selectStoreId = (state: SessionInfoState) => state.storeId;
```

---

## Internationalization

### Usage

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function CartComponent() {
  const t = useTranslations('cart');

  return (
    <div>
      <h1>{t('title')}</h1>      {/* "Your Cart" / "您的购物车" / etc. */}
      <button>{t('checkout')}</button>  {/* Translated */}
    </div>
  );
}
```

### Available Namespaces

- `common` - General UI (home, cart, order, etc.)
- `menu` - Menu browsing
- `cart` - Cart operations
- `order` - Order placement
- `table` - Table joining
- `restaurant` - Restaurant info
- `errors` - Error messages

---

## Development Patterns

### 1. Using the Debug Utility

**Location:** `utils/debug.ts`

```typescript
import { debug } from '@/utils/debug';

// Only logs in development
debug.log('Cart updated:', cart);

// Always logs errors
debug.error('Failed to add item:', error);

// Only logs warnings in development
debug.warn('Item not found:', itemId);
```

**Benefits:**

- ✅ Clean production logs
- ✅ Useful development debugging
- ✅ Consistent logging interface

### 2. Precise Currency Calculations

Use `decimal.js` for all currency operations:

```typescript
import Decimal from 'decimal.js';

const itemTotal = new Decimal(item.price).times(item.quantity).toFixed(2);

const cartTotal = items
  .reduce((sum, item) => sum.plus(item.total), new Decimal(0))
  .toFixed(2);
```

### 3. API Service Pattern

```typescript
import { apiFetch, unwrapData } from '@/utils/apiFetch';

export async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: '/categories',
    query: { storeSlug },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}
```

---

## Socket.IO Events

### Subscribed Events

| Event          | Description           | Handler           |
| -------------- | --------------------- | ----------------- |
| `cart:updated` | Cart state changed    | `setCart(cart)`   |
| `cart:error`   | Cart operation failed | `setError(error)` |

### Event Flow

```
User Action → Optimistic Update → API Call → WebSocket Broadcast → Final Update
```

---

## Translation Keys

**Cart Namespace:**

```typescript
t('cart.title'); // "Your Cart"
t('cart.empty'); // "Your cart is empty"
t('cart.checkout'); // "Checkout"
t('cart.clearCart'); // "Clear Cart"
```

**Menu Namespace:**

```typescript
t('menu.title'); // "Our Menu"
t('menu.addToCart'); // "Add to Cart"
t('menu.outOfStock'); // "Out of Stock"
```

---

## Code Quality Rules

### ✅ DO

- Use `debug.log()` instead of `console.log()`
- Handle optimistic updates with rollback
- Use `decimal.js` for currency calculations
- Export selectors from all stores
- Clean up Socket.IO listeners
- Show skeleton loaders
- Add translations for all languages

### ❌ DON'T

- Use `console.log()` (use `debug.log()`)
- Use JavaScript numbers for currency
- Forget WebSocket cleanup
- Skip error handling in optimistic updates
- Hardcode text (use translations)

---

## File Naming Conventions

| Type       | Convention     | Example                    |
| ---------- | -------------- | -------------------------- |
| Services   | `*.service.ts` | `cart.service.ts`          |
| Stores     | `*.store.ts`   | `cart.store.ts`            |
| Types      | `*.types.ts`   | `cart.types.ts`            |
| Hooks      | `use*.ts`      | `useCartSocketListener.ts` |
| Components | PascalCase     | `CartItem.tsx`             |

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
npm run build --filter=@app/sos
npm run start --filter=@app/sos
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.yourproduction.com/api
```

---

## Troubleshooting

### Socket Connection Issues

1. Check WebSocket server is running
2. Verify CORS settings
3. Check session is valid
4. Inspect Network tab for connection errors

### Cart Not Syncing

1. Check `useCartSocketListener` is mounted
2. Verify WebSocket connection in DevTools
3. Check session ID is valid
4. Review server-side cart events

### TypeScript Errors

```bash
npm run check-types --workspace=@app/sos
```

---

## Learn More

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Decimal.js Documentation](http://mikemcl.github.io/decimal.js/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

## Related Documentation

- **`../../README.md`** - Monorepo overview
- **`../../CLAUDE.md`** - Project guidelines
- **`../../I18N_GUIDE.md`** - i18n complete guide

---

**SOS Application - Origin Food House**
Version 0.1.0
