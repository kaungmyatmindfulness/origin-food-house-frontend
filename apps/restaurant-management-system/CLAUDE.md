# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Important:** This app is part of a Turborepo monorepo. See the root `/CLAUDE.md` for shared conventions, design system, and quality gates that apply across all apps.

## App Overview

**Restaurant Management System (RMS)** - Point of Sale system for restaurant staff.

- **Port:** 3002
- **Package name:** `@app/restaurant-management-system`
- **Purpose:** Menu management, table management, order processing, kitchen display, reporting
- **Build Output:** Static export (`out/` folder) for Tauri desktop integration

## Architecture: Static Site Generation (SSG)

**RMS uses full static export** (`output: 'export'` in next.config.js) - all pages are pre-rendered at build time as static HTML files. This architecture enables **Tauri desktop app** integration.

### Why Static Export?

| Benefit              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| **Tauri compatible** | Static HTML/JS/CSS can be bundled into native desktop |
| **Offline-capable**  | POS systems must work without internet                |
| **Fast startup**     | Pre-rendered pages load instantly                     |
| **No server needed** | Runs entirely on client - no Node.js runtime required |

### Build Configuration

```javascript
// next.config.js
const nextConfig = {
  output: 'export', // Static HTML export
  images: { unoptimized: true }, // Required for static export
  trailingSlash: true, // Consistent static file serving
};
```

### Page Pattern

All pages are **Client Components** that fetch data on mount:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore, selectSelectedStoreId } from '@/features/auth/store/auth.store';
import { menuKeys } from '@/features/menu/queries/menu.keys';
import { getCategories } from '@/features/menu/services/category.service';

export default function MenuPage() {
  const storeId = useAuthStore(selectSelectedStoreId);

  // ✅ Client-side data fetching (SSG-friendly)
  const { data: categories, isLoading } = useQuery({
    queryKey: menuKeys.categories(storeId!),
    queryFn: () => getCategories(storeId!),
    enabled: !!storeId,
  });

  if (isLoading) return <MenuSkeleton />;

  return <MenuContent categories={categories} />;
}
```

### Anti-Patterns for SSG

```typescript
// ❌ WRONG - Server components with data fetching
export default async function MenuPage() {
  const categories = await getCategories(storeId);
  return <MenuContent categories={categories} />;
}

// ❌ WRONG - dynamic = 'force-dynamic' breaks static export
export const dynamic = 'force-dynamic';

// ❌ WRONG - Middleware doesn't run in static export
// (middleware.ts has been removed)

// ✅ CORRECT - Client-side with React Query
'use client';
export default function MenuPage() {
  const { data } = useQuery({ ... });
  return <MenuContent data={data} />;
}
```

## Internationalization (i18n)

**RMS uses client-side locale management** - no middleware or server-side locale detection.

### How Locale Works

```
┌─────────────────────────────────────────────────────────┐
│  1. App loads → locale.store.ts reads from localStorage │
│  2. IntlProvider loads messages via dynamic import      │
│  3. Messages cached in memory for instant switching     │
│  4. All 4 locales preloaded for offline support         │
└─────────────────────────────────────────────────────────┘
```

### Locale Store (Zustand)

```typescript
import { useLocaleStore, selectLocale } from '@/i18n/locale.store';

// Read current locale
const locale = useLocaleStore(selectLocale);

// Change locale (instant, no page reload)
const setLocale = useLocaleStore((state) => state.setLocale);
setLocale('zh');
```

### Supported Locales

| Code | Language         | Flag |
| ---- | ---------------- | ---- |
| `en` | English          | 🇬🇧   |
| `zh` | 中文 (Chinese)   | 🇨🇳   |
| `my` | မြန်မာ (Myanmar) | 🇲🇲   |
| `th` | ไทย (Thai)       | 🇹🇭   |

### Translation Files

Messages split by feature domain, loaded dynamically:

```
messages/
├── en/                    # 16 feature files merged at runtime
│   ├── common.json
│   ├── auth.json
│   ├── menu.json
│   ├── navigation.json
│   ├── tables.json
│   ├── store.json
│   ├── kitchen.json
│   ├── orders.json
│   ├── payments.json
│   ├── reports.json
│   ├── personnel.json
│   ├── auditLogs.json
│   ├── landing.json
│   ├── tierUsage.json
│   ├── admin.json
│   └── sales.json
├── zh/
├── my/
└── th/
```

## Offline-First Support

RMS is configured for offline desktop operation:

### Network Provider

```typescript
import { useNetwork } from '@/utils/network-provider';

const { isOnline } = useNetwork();
// Toast notifications shown automatically on status change
```

### React Query Offline Mode

```typescript
// Configured in providers.tsx
{
  networkMode: 'offlineFirst',
  retry: (count) => navigator.onLine && count < 2,
  gcTime: 30 * 60 * 1000, // Keep cached data 30 minutes
}
```

## Commands

```bash
# Development
npm run dev --filter=@app/restaurant-management-system    # Run on port 3002

# Build (generates static export in out/ folder)
npm run build --workspace=@app/restaurant-management-system

# Test static export locally
npx serve apps/restaurant-management-system/out

# Testing (RMS is the only app with tests)
npm test --workspace=@app/restaurant-management-system
npm run test:watch --workspace=@app/restaurant-management-system
npm run test:coverage --workspace=@app/restaurant-management-system
```

## Route Structure

**Note:** Routes are flattened (no `[locale]` folder) for SSG compatibility. Locale is handled client-side via Zustand store.

```
app/
├── layout.tsx               # Root layout (client component)
├── page.tsx                 # Landing page
├── (no-dashboard)/          # Public routes (no sidebar)
│   └── store/choose|create  # Store selection before entering hub
├── auth/callback            # Auth0 callback
├── hub/                     # Main dashboard (requires store selection)
│   ├── sale/                # Sales page (all roles)
│   ├── profile/             # User profile
│   ├── (owner-admin)/       # Owner/Admin only
│   │   ├── menu/            # Menu management
│   │   ├── tables/          # Table management & QR codes
│   │   ├── store/           # Store settings
│   │   ├── orders/          # Order management
│   │   ├── reports/         # Analytics & reports
│   │   ├── personnel/       # Staff management
│   │   └── audit-logs/      # Activity logs
│   └── (chef)/              # Chef role
│       └── kitchen/         # Kitchen display
└── admin/                   # Platform admin routes
```

## Features

| Feature      | Location                 | Description                              |
| ------------ | ------------------------ | ---------------------------------------- |
| auth         | `features/auth/`         | Auth state, protected routes, user roles |
| menu         | `features/menu/`         | Categories, items, customizations        |
| orders       | `features/orders/`       | Order creation and management            |
| sales        | `features/sales/`        | Quick sale, POS interface                |
| kitchen      | `features/kitchen/`      | Kitchen display, order status updates    |
| tables       | `features/tables/`       | Table management, QR code generation     |
| store        | `features/store/`        | Store settings, information              |
| reports      | `features/reports/`      | Sales analytics, reports                 |
| payments     | `features/payments/`     | Payment processing                       |
| discounts    | `features/discounts/`    | Discount management                      |
| personnel    | `features/personnel/`    | Staff management                         |
| tiers        | `features/tiers/`        | Subscription tiers                       |
| subscription | `features/subscription/` | Store subscription management            |
| audit-logs   | `features/audit-logs/`   | Activity logging                         |
| admin        | `features/admin/`        | Platform admin features                  |
| user         | `features/user/`         | User profile management                  |

## Role-Based Access

Three user roles with different permissions:

| Role      | Access                                          |
| --------- | ----------------------------------------------- |
| **Owner** | Full access, store settings, personnel, reports |
| **Admin** | Menu, tables, orders, kitchen, limited reports  |
| **Staff** | Sales page, view menu only                      |

Protected with `useProtected` hook:

```typescript
const { isLoading } = useProtected({
  allowedRoles: ['OWNER', 'ADMIN'],
  unauthorizedRedirectTo: '/hub/sale',
});
```

## Tablet-First Design System

**RMS is designed for tablet use (10-12" screens).** All UI must be touch-friendly and easily accessible without a mouse or keyboard.

### Touch Target Guidelines

**Minimum touch target size: 44x44px** (Apple Human Interface Guidelines)

```typescript
// ✅ CORRECT - Large touch targets
<Button size="lg" className="min-h-11 min-w-11">  {/* 44px minimum */}
  <Plus className="h-5 w-5" />
</Button>

// ✅ CORRECT - Icon button with adequate size
<Button variant="ghost" size="icon" className="h-11 w-11">
  <Trash2 className="h-5 w-5" />
</Button>

// ❌ WRONG - Too small for touch
<Button size="sm" className="h-8 w-8">
  <Plus className="h-4 w-4" />
</Button>
```

### Touch Target Size Reference

| Element Type       | Minimum Size | Recommended Size | Tailwind Class     |
| ------------------ | ------------ | ---------------- | ------------------ |
| Primary buttons    | 44px height  | 48-56px height   | `h-11` to `h-14`   |
| Icon buttons       | 44x44px      | 48x48px          | `h-11 w-11`        |
| List items         | 44px height  | 48-56px height   | `min-h-11`         |
| Input fields       | 44px height  | 48px height      | `h-11` or `h-12`   |
| Checkboxes/Radios  | 24x24px      | 24x24px + padding| `h-6 w-6` + `p-2`  |
| Tab items          | 44px height  | 48px height      | `min-h-11`         |

### Spacing for Touch Interfaces

```typescript
// ✅ CORRECT - Adequate spacing between touchable elements
<div className="flex gap-3">  {/* 12px gap minimum */}
  <Button>Cancel</Button>
  <Button>Save</Button>
</div>

// ✅ CORRECT - List with touch-friendly spacing
<div className="space-y-2">  {/* 8px minimum between items */}
  {items.map(item => (
    <ListItem key={item.id} className="min-h-14 py-3" />
  ))}
</div>

// ❌ WRONG - Elements too close together
<div className="flex gap-1">
  <Button>Cancel</Button>
  <Button>Save</Button>
</div>
```

### Grid Layouts for Tablets

Optimize for 10-12" landscape tablets (1024px-1366px width):

```typescript
// ✅ CORRECT - POS menu grid (large touchable cards)
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {menuItems.map(item => (
    <MenuItemCard
      key={item.id}
      className="min-h-32 p-4"  // Large touch area
    />
  ))}
</div>

// ✅ CORRECT - Category tabs (scrollable, large targets)
<ScrollArea className="w-full" orientation="horizontal">
  <div className="flex gap-2 pb-2">
    {categories.map(cat => (
      <Button
        key={cat.id}
        variant={selected === cat.id ? 'default' : 'outline'}
        className="min-w-24 h-12 shrink-0"  // Large, fixed width
      >
        {cat.name}
      </Button>
    ))}
  </div>
</ScrollArea>

// ✅ CORRECT - Order summary with touch-friendly rows
<div className="space-y-2">
  {orderItems.map(item => (
    <div
      key={item.id}
      className="flex items-center justify-between min-h-14 px-4 py-2
                 rounded-lg border border-border bg-card"
    >
      <span>{item.name}</span>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="h-10 w-10">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button size="icon" variant="outline" className="h-10 w-10">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>
```

### Avoid Hover-Dependent Interactions

Tablets don't have hover state - all interactions must work with tap only:

```typescript
// ❌ WRONG - Information only on hover
<div className="group">
  <Button>View Details</Button>
  <div className="hidden group-hover:block">  {/* Never visible on tablet! */}
    <p>Important information...</p>
  </div>
</div>

// ✅ CORRECT - Information always visible or tap-to-reveal
<div>
  <Button onClick={() => setShowDetails(!showDetails)}>
    View Details
    <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform",
      showDetails && "rotate-180"
    )} />
  </Button>
  {showDetails && <p>Important information...</p>}
</div>

// ✅ CORRECT - Use press states instead of hover
<Button className="active:scale-95 active:bg-primary/90">
  Tap Me
</Button>
```

### Dialog/Modal Sizing for Tablets

```typescript
// ✅ CORRECT - Full-width dialog on tablets
<Dialog>
  <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl">Title</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      {/* Content with adequate spacing */}
    </div>
    <DialogFooter className="flex-col gap-2 sm:flex-row">
      <Button variant="outline" className="h-12 w-full sm:w-auto">
        Cancel
      </Button>
      <Button className="h-12 w-full sm:w-auto">
        Confirm
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Keyboard Considerations

Even on tablets, external keyboards may be used. Support both:

```typescript
// ✅ CORRECT - Support both touch and keyboard
<Button
  onClick={handleSubmit}
  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
  className="h-12"
>
  Submit Order
</Button>

// ✅ CORRECT - Form with appropriate input modes
<Input
  type="number"
  inputMode="numeric"  // Shows numeric keyboard on tablet
  pattern="[0-9]*"
  className="h-12 text-lg"
/>
```

### Typography for Readability

Use larger text sizes for tablet viewing distance:

```typescript
// ✅ CORRECT - Readable text sizes
<h1 className="text-2xl font-bold">Page Title</h1>
<p className="text-base">Regular body text</p>
<span className="text-sm text-muted-foreground">Secondary info</span>

// ✅ CORRECT - Price displays (prominent)
<span className="text-xl font-semibold tabular-nums">
  ${price.toFixed(2)}
</span>

// ❌ WRONG - Too small for quick scanning
<p className="text-xs">Important order information</p>
```

### Quick Reference: Common POS Patterns

```typescript
// Menu Item Card
<Card className="min-h-32 cursor-pointer active:scale-[0.98] transition-transform">
  <CardContent className="p-4">
    <h3 className="font-medium text-lg">{item.name}</h3>
    <p className="text-xl font-bold text-primary">${item.price}</p>
  </CardContent>
</Card>

// Category Selector
<ToggleGroup type="single" className="flex-wrap gap-2">
  {categories.map(cat => (
    <ToggleGroupItem
      key={cat.id}
      value={cat.id}
      className="h-12 px-6 text-base"
    >
      {cat.name}
    </ToggleGroupItem>
  ))}
</ToggleGroup>

// Action Button Row (bottom of screen)
<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
  <div className="flex gap-3">
    <Button variant="outline" className="flex-1 h-14 text-lg">
      Cancel
    </Button>
    <Button className="flex-1 h-14 text-lg">
      Complete Order
    </Button>
  </div>
</div>

// Quantity Stepper
<div className="flex items-center gap-1">
  <Button
    size="icon"
    variant="outline"
    className="h-12 w-12 rounded-full"
    onClick={() => setQty(q => Math.max(0, q - 1))}
  >
    <Minus className="h-5 w-5" />
  </Button>
  <span className="w-12 text-center text-xl font-medium tabular-nums">
    {quantity}
  </span>
  <Button
    size="icon"
    variant="outline"
    className="h-12 w-12 rounded-full"
    onClick={() => setQty(q => q + 1)}
  >
    <Plus className="h-5 w-5" />
  </Button>
</div>
```

### Tablet-Specific Anti-Patterns

```typescript
// ❌ BAD - Tiny icon buttons
<Button size="sm" className="h-6 w-6">
  <X className="h-3 w-3" />
</Button>

// ❌ BAD - Hover-only tooltips for critical info
<Tooltip>
  <TooltipTrigger>
    <Button>?</Button>
  </TooltipTrigger>
  <TooltipContent>Critical information only visible on hover</TooltipContent>
</Tooltip>

// ❌ BAD - Dense data tables without touch consideration
<Table>
  <TableRow className="h-8">  {/* Too short for touch */}
    <TableCell className="py-1 px-2">...</TableCell>
  </TableRow>
</Table>

// ❌ BAD - Relying on right-click context menus
element.addEventListener('contextmenu', showMenu);

// ❌ BAD - Small close buttons in corners
<DialogClose className="absolute right-2 top-2 h-6 w-6">
  <X className="h-4 w-4" />
</DialogClose>
```

---

## RMS-Specific Patterns

### Auth Store Selectors

Always use exported selectors for store state:

```typescript
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';

// ✅ Correct
const storeId = useAuthStore(selectSelectedStoreId);

// ❌ Wrong - creates new function reference each render
const storeId = useAuthStore((state) => state.selectedStoreId);
```

### Socket.IO for Real-Time

Kitchen display and order updates use Socket.IO:

```typescript
// Socket provider wraps the hub layout
// Kitchen orders update in real-time via socket events
```

## Testing

RMS is the only app with Jest tests configured:

- Uses `@testing-library/react` and `@testing-library/user-event`
- Tests located alongside components: `*.test.tsx`
- Mock API services, not implementation details
- Use `screen.getByRole()` over `getByTestId()`

```typescript
// Example test pattern
jest.mock('@/features/menu/services/category.service');

it('should display categories', async () => {
  render(<CategoryList />);
  await waitFor(() => {
    expect(screen.getByText('Appetizers')).toBeInTheDocument();
  });
});
```

## Key Files

| File                             | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| `next.config.js`                 | Static export configuration               |
| `src/app/layout.tsx`             | Root layout (client component)            |
| `src/utils/apiFetch.ts`          | Configured API client with auth           |
| `src/utils/providers.tsx`        | React Query + Network provider            |
| `src/utils/network-provider.tsx` | Offline detection for desktop app         |
| `src/i18n/config.ts`             | Locale configuration (en, zh, my, th)     |
| `src/i18n/locale.store.ts`       | Zustand store for client-side locale      |
| `src/i18n/messages.ts`           | Dynamic message loader with caching       |
| `src/i18n/IntlProvider.tsx`      | Client-side internationalization provider |
| `src/features/auth/store/`       | Auth state (selectedStoreId, etc)         |
| `src/features/auth/hooks/`       | useProtected hook                         |
| `src/common/constants/routes.ts` | Route constants                           |

## Tauri Desktop Integration

The static export in `out/` can be bundled with Tauri:

```bash
# Build static export
npm run build --workspace=@app/restaurant-management-system

# The out/ folder contains:
# - index.html (and all route HTML files)
# - _next/ (JS/CSS bundles)
# - Static assets (images, fonts)

# Tauri can load these files directly
```

**Desktop Features:**

- Offline POS operation
- Native system integration (printers, cash drawers)
- Better performance on restaurant hardware
- Local data persistence via Tauri APIs
