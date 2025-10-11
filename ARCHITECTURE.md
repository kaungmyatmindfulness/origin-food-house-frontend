# Architecture Documentation

**Origin Food House Frontend Monorepo**

This document provides a comprehensive overview of the architectural decisions, patterns, and best practices used throughout the codebase.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Shared Packages](#shared-packages)
6. [Application Architecture](#application-architecture)
7. [Design Patterns](#design-patterns)
8. [Data Flow](#data-flow)
9. [State Management Strategy](#state-management-strategy)
10. [API Integration](#api-integration)
11. [Internationalization](#internationalization)
12. [Performance Optimizations](#performance-optimizations)
13. [Security Considerations](#security-considerations)

---

## System Overview

### Purpose

Origin Food House is a comprehensive restaurant management system consisting of two interconnected applications:

1. **POS (Point of Sale)** - For restaurant staff to manage operations
2. **SOS (Self-Ordering System)** - For customers to browse and order

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Monorepo                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                   ┌──────────────┐       │
│  │   POS App    │                   │   SOS App    │       │
│  │  (Port 3002) │                   │  (Port 3001) │       │
│  │              │                   │              │       │
│  │ - Menu Mgmt  │                   │ - Browse     │       │
│  │ - Tables     │                   │ - Cart       │       │
│  │ - Settings   │                   │ - Order      │       │
│  └──────┬───────┘                   └──────┬───────┘       │
│         │                                  │               │
│         └────────────┬─────────────────────┘               │
│                      │                                     │
│         ┌────────────▼──────────────┐                      │
│         │   Shared Packages         │                      │
│         ├───────────────────────────┤                      │
│         │ @repo/api - API utilities │                      │
│         │ @repo/ui  - UI components │                      │
│         │ @repo/*   - Config        │                      │
│         └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Backend REST API    │
              │   + WebSocket Server  │
              └───────────────────────┘
```

---

## Architecture Principles

### 1. **Separation of Concerns**

Each layer has a single responsibility:
- **UI Layer**: Presentation and user interaction
- **Service Layer**: API communication
- **State Layer**: Application state management
- **Type Layer**: Type definitions and contracts

### 2. **DRY (Don't Repeat Yourself)**

- Shared utilities in `@repo/api` package
- Reusable UI components in `@repo/ui`
- Common hooks in `common/hooks/`
- Centralized constants

### 3. **Type Safety First**

- 100% TypeScript coverage
- Strict mode enabled
- No `any` types
- Explicit return types for all functions

### 4. **Feature-Sliced Design**

- Domain-driven module organization
- Self-contained features
- Minimal cross-feature dependencies
- Clear boundaries

### 5. **Progressive Enhancement**

- Server components by default
- Client components only when needed
- Skeleton loading states
- Graceful degradation

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 15.3+ | React framework with App Router |
| **UI Library** | React | 19.1+ | User interface |
| **Language** | TypeScript | 5.8+ | Type-safe development |
| **Build Tool** | Turborepo | 2.5+ | Monorepo management |
| **Package Manager** | npm | 11.6+ | Dependency management |

### State & Data

| Purpose | Technology | Usage |
|---------|-----------|-------|
| **Global State** | Zustand | Auth, UI state |
| **Server State** | React Query | API data caching |
| **Real-time** | Socket.IO | Cart synchronization (SOS) |
| **Forms** | react-hook-form + Zod | Form validation |

### Styling & UI

| Purpose | Technology |
|---------|-----------|
| **CSS Framework** | Tailwind CSS v4 |
| **Component Library** | shadcn/ui (via @repo/ui) |
| **Animations** | Motion |
| **Icons** | Lucide React |
| **Notifications** | Sonner |

### Utilities

| Purpose | Technology |
|---------|-----------|
| **i18n** | next-intl |
| **HTTP Client** | Custom apiFetch (built on Fetch API) |
| **Query Strings** | qs |
| **Currency** | decimal.js (SOS) |
| **Drag & Drop** | @dnd-kit (POS) |
| **QR Codes** | qrcode.react (POS) |

---

## Monorepo Structure

```
origin-food-house-frontend/
│
├── apps/                         # Applications
│   ├── pos/                     # Point of Sale (3002)
│   └── sos/                     # Self-Ordering System (3001)
│
├── packages/                     # Shared packages
│   ├── api/                     # API utilities & types ⭐
│   ├── ui/                      # UI component library
│   ├── eslint-config/           # Linting configuration
│   └── typescript-config/       # TypeScript configuration
│
├── node_modules/                # Dependencies (git-ignored)
│
├── ARCHITECTURE.md              # This file
├── CLAUDE.md                    # AI assistant guidelines
├── I18N_GUIDE.md                # Internationalization guide
├── README.md                    # Main documentation
├── package.json                 # Root package configuration
└── turbo.json                   # Turborepo configuration
```

---

## Shared Packages

### @repo/api

**Purpose:** Eliminate code duplication for API-related utilities

**Contents:**
```
packages/api/
├── src/
│   ├── utils/
│   │   └── apiFetch.ts          # API client factory
│   ├── types/
│   │   ├── api.types.ts         # StandardApiResponse
│   │   └── upload.types.ts      # Upload types
│   └── services/
│       └── upload.service.ts    # Upload service factory
├── package.json
├── tsconfig.json
└── eslint.config.js
```

**Key Exports:**
- `createApiFetch(config)` - Configurable API client
- `unwrapData(response, errorMsg)` - Null-safe data extraction
- Error classes: `ApiError`, `UnauthorizedError`, `NetworkError`
- `StandardApiResponse<T>` type

**Benefits:**
- Single source of truth for API logic
- Consistent error handling
- Dependency injection for app-specific behavior
- ~380 lines of code eliminated

### @repo/ui

**Purpose:** Shared UI component library based on shadcn/ui

**Contents:**
- 40+ React components (Button, Dialog, Form, Table, etc.)
- Custom hooks (use-toast, use-mobile)
- Utility functions (cn() for className merging)
- Global CSS with Tailwind configuration

**Benefits:**
- Consistent UI across applications
- Reusable components
- Type-safe props
- Tailwind integration

---

## Application Architecture

### Feature-Sliced Design

Both applications follow a consistent feature-based structure:

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (async, provides i18n)
│   ├── page.tsx           # Landing page
│   └── [routes]/          # Route-specific pages
│
├── features/               # Domain features
│   └── [feature]/
│       ├── components/    # Feature UI components
│       ├── hooks/         # Feature-specific hooks
│       ├── queries/       # React Query key factories
│       ├── services/      # API calls
│       ├── store/         # Zustand state (if needed)
│       └── types/         # TypeScript definitions
│
├── common/                 # Shared within app
│   ├── components/        # Shared widgets
│   ├── constants/         # Routes, messages
│   ├── hooks/             # Reusable hooks
│   ├── services/          # Common services
│   └── types/             # Shared types
│
├── utils/                  # Utilities
│   ├── apiFetch.ts        # Configured API client
│   ├── debug.ts           # Debug utility
│   └── providers.tsx      # Context providers
│
├── i18n/                   # Internationalization
│   ├── config.ts          # Locale configuration
│   └── request.ts         # next-intl setup
│
└── middleware.ts           # Next.js middleware

messages/                   # Translation files (app root)
├── en.json                # English
├── zh.json                # Chinese
├── my.json                # Myanmar
└── th.json                # Thai
```

### Dependency Flow

```
┌─────────────────────────────────────────────┐
│           Page Components                   │
│         (app/[route]/page.tsx)              │
└───────────────┬─────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│      Feature Components                     │
│   (features/*/components/*.tsx)             │
└────┬──────────────────────┬─────────────────┘
     │                      │
     ▼                      ▼
┌─────────────┐    ┌──────────────────┐
│   Hooks     │    │  Zustand Store   │
│  (useQuery) │    │  (global state)  │
└──────┬──────┘    └──────────────────┘
       │
       ▼
┌─────────────────┐
│    Services     │
│ (API calls)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   apiFetch      │
│ (@repo/api)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
└─────────────────┘
```

---

## Design Patterns

### 1. Factory Pattern

**Usage:** API client configuration

```typescript
// @repo/api - factory
export function createApiFetch(config: ApiFetchConfig) {
  return async function apiFetch<T>(...) { ... }
}

// apps/pos - POS-specific instance
export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  onUnauthorized: () => useAuthStore.getState().clearAuth(),
});

// apps/sos - SOS-specific instance
export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  // No auth clearing needed
});
```

**Benefits:**
- Shared core logic
- App-specific customization via dependency injection
- Single source of truth

### 2. Repository Pattern

**Usage:** Service layer abstracts data access

```typescript
// Service = Repository
export async function getCategories(storeId: string): Promise<Category[]> {
  const res = await apiFetch<Category[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}

// Components don't know about HTTP details
const { data } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});
```

### 3. Query Key Factory Pattern

**Usage:** Type-safe, hierarchical query keys

```typescript
export const menuKeys = {
  all: ['menu'] as const,
  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,
  category: (storeId: string, categoryId: string) =>
    [...menuKeys.categories(storeId), categoryId] as const,
};

// Type-safe usage
queryClient.invalidateQueries({ queryKey: menuKeys.categories(storeId) });
```

### 4. Optimistic Updates Pattern

**Usage:** SOS cart operations

```typescript
// 1. Update UI immediately
set((state) => {
  state.cart.items.push(newItem);
});

// 2. Call API
try {
  await addItemToCart(payload);
} catch (error) {
  // 3. Rollback on failure
  set((state) => {
    state.cart = originalCart;
  });
}

// 4. WebSocket confirms final state
socket.on('cart:updated', (cart) => setCart(cart));
```

### 5. Compound Component Pattern

**Usage:** Dialog management

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>
```

---

## Data Flow

### POS App - Menu Management Flow

```
User clicks "Create Menu Item"
         │
         ▼
useDialog() hook sets dialogOpen = true
         │
         ▼
Form submits → useMutation() called
         │
         ▼
createMenuItem() service → apiFetch()
         │
         ▼
Backend API processes request
         │
         ▼
Success → queryClient.invalidateQueries(menuKeys.all)
         │
         ▼
React Query refetches categories
         │
         ▼
UI updates with new item
```

### SOS App - Cart Update Flow

```
User clicks "Add to Cart"
         │
         ▼
optimisticAddItem() called
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
   UI updates         API call via
   immediately        addItemToCart()
         │                  │
         │                  ▼
         │            Backend processes
         │                  │
         │                  ▼
         │            WebSocket broadcasts
         │            'cart:updated' event
         │                  │
         └──────┬───────────┘
                │
                ▼
         setCart() with final state
                │
                ▼
         All devices sync
```

---

## State Management Strategy

### State Categories

| Type | Where | Example |
|------|-------|---------|
| **Server State** | React Query | Menu items, categories, tables |
| **Global UI State** | Zustand | Auth status, selected store |
| **Local UI State** | useState | Dialog open/close, form inputs |
| **URL State** | useSearchParams | Filters, pagination |
| **Form State** | react-hook-form | Form fields, validation |

### Decision Tree

```
Need to store state?
│
├─ Is it server data? → Use React Query
│
├─ Is it global (multiple components/routes)? → Use Zustand
│
├─ Is it in the URL (shareable)? → Use search params
│
├─ Is it a form? → Use react-hook-form
│
└─ Otherwise → Use useState (local)
```

### Zustand Usage Guidelines

**DO use Zustand for:**
- Authentication status
- Selected store/restaurant
- Theme preferences
- Language preference (syncs with cookie)
- Global UI state (sidebar open/closed)

**DON'T use Zustand for:**
- API response data (use React Query)
- Form state (use react-hook-form)
- Component-specific state (use useState)
- Derived data (use selectors or useMemo)

---

## API Integration

### Request Flow

```
Component
    │
    ▼
Service Function (types, business logic)
    │
    ▼
apiFetch (configured instance)
    │
    ▼
createApiFetch factory (@repo/api)
    │
    ├─ Build URL with query params (qs library)
    ├─ Set headers (Content-Type, Accept)
    ├─ Add credentials: 'include'
    │
    ▼
Fetch API
    │
    ▼
Response Handling
    │
    ├─ Parse JSON
    ├─ Check response.ok
    ├─ Check json.status === 'error'
    │
    ├─ If 401 → onUnauthorized() + throw
    ├─ If error → toast.error() + throw
    │
    ▼
Return StandardApiResponse<T>
    │
    ▼
unwrapData() extracts data field
    │
    ▼
Return to component
```

### Error Handling Strategy

```
Error occurs at any level
         │
         ▼
apiFetch catches and processes
         │
         ├─ NetworkError → Can't reach server
         ├─ ApiError → Server returned error
         ├─ UnauthorizedError (401) → Clear auth
         │
         ▼
toast.error() shows user message
         │
         ▼
Throw error to caller
         │
         ▼
React Query error boundary
or component error handler
```

---

## Internationalization

### Architecture

```
User selects language
         │
         ▼
LanguageSwitcher sets NEXT_LOCALE cookie
         │
         ▼
Middleware reads cookie on next request
         │
         ▼
getLocale() returns user's locale
         │
         ▼
getMessages() loads locale JSON file
         │
         ▼
NextIntlClientProvider provides translations
         │
         ▼
useTranslations() hook in components
         │
         ▼
t('key') returns translated string
```

### Translation Organization

```json
{
  "namespace": {
    "key": "value"
  }
}
```

**Namespaces:**
- `common` - Shared UI elements
- `auth` - Authentication
- `menu` - Menu operations
- `cart` - Cart operations
- `errors` - Error messages

**Usage:**
```typescript
const t = useTranslations('namespace');
t('key') // Returns translated value
```

---

## Performance Optimizations

### 1. Code Splitting

- Automatic via Next.js App Router
- Route-based splitting
- Component-level with `lazy()` when needed

### 2. Memoization

```typescript
// useCallback for event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// useMemo for expensive computations
const sortedItems = useMemo(() =>
  items.sort((a, b) => a.order - b.order),
  [items]
);

// Selectors for Zustand (auto-memoized)
const storeId = useAuthStore(selectSelectedStoreId);
```

### 3. React Query Caching

- Automatic background refetching
- Stale-while-revalidate strategy
- Query key factories for efficient invalidation
- Optimistic updates (SOS cart)

### 4. Image Optimization

- Next.js Image component
- Automatic format selection (WebP)
- Lazy loading
- Responsive images

### 5. Bundle Optimization

- Turbopack for fast dev builds
- Tree shaking in production
- Shared chunk optimization via Turborepo

---

## Security Considerations

### Authentication

**POS App:**
- httpOnly cookies (XSS protection)
- Automatic token refresh
- CSRF protection via cookies
- 401 → auto logout

**SOS App:**
- Session-based (no sensitive data)
- Session expiration handling
- No persistent auth storage

### Data Protection

- TypeScript prevents type errors
- Zod validation on forms
- API response validation
- Input sanitization

### Best Practices

- ✅ Never store tokens in localStorage (POS)
- ✅ Use credentials: 'include' for cookies
- ✅ Validate all user inputs
- ✅ Sanitize data before rendering
- ✅ Use HTTPS in production
- ✅ Implement CORS properly

---

## Development Workflow

### Adding a New Feature

```
1. Create feature folder
   └── features/new-feature/

2. Add types
   └── types/new-feature.types.ts

3. Create service
   └── services/new-feature.service.ts
   └── Use apiFetch, unwrapData
   └── Add JSDoc, proper return types

4. Add query keys (if using React Query)
   └── queries/new-feature.keys.ts

5. Create store (if global state needed)
   └── store/new-feature.store.ts
   └── Export selectors

6. Build components
   └── components/FeatureComponent.tsx
   └── Use skeleton loading
   └── Use translations

7. Add translations
   └── Update all 4 language files

8. Add routes
   └── app/[route]/page.tsx

9. Test
   └── npm run check-types
   └── npm run lint
```

---

## File Organization Standards

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Services | `*.service.ts` | `menu.service.ts` |
| Stores | `*.store.ts` | `cart.store.ts` |
| Types | `*.types.ts` | `category.types.ts` |
| Query Keys | `*.keys.ts` | `menu.keys.ts` |
| Components | `PascalCase.tsx` | `CategoryCard.tsx` |
| Hooks | `use*.ts` | `useProtected.ts` |
| Utilities | `camelCase.ts` | `apiFetch.ts` |
| Constants | `camelCase.ts` | `routes.ts` |

### Folder Conventions

- `components/` (not `ui/`)
- `store/` singular (not `stores/` plural)
- `services/` plural
- `types/` plural
- `hooks/` plural
- `queries/` plural

---

## Testing Strategy

### Type Safety
- TypeScript compiler (`npm run check-types`)
- Strict mode enabled
- No implicit any

### Linting
- ESLint with custom config
- Max 0 warnings enforced
- Auto-fix on save (recommended)

### Code Quality
- Prettier formatting
- Consistent naming conventions
- JSDoc for public APIs

### Future Additions
- Unit tests (Jest + React Testing Library)
- Integration tests
- E2E tests (Playwright)
- Visual regression tests (Chromatic)

---

## Deployment Architecture

### Build Process

```
npm run build
    │
    ▼
Turborepo orchestrates
    │
    ├─ Build @repo/api
    ├─ Build @repo/ui
    │
    ▼
Next.js builds apps
    │
    ├─ POS app → .next/ folder
    └─ SOS app → .next/ folder
    │
    ▼
Production bundles ready
```

### Environment Configuration

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.production.com/api
NODE_ENV=production
```

---

## Migration & Refactoring History

### Phase 1: Shared API Package
- Created `@repo/api` package
- Eliminated code duplication (~380 lines)
- Factory pattern for configuration

### Phase 2: Naming Standardization
- Renamed `ui/` → `components/`
- Renamed `stores/` → `store/`
- Fixed `.services.ts` → `.service.ts`

### Phase 3: Type Safety
- Removed all `unknown` return types
- Added `unwrapData()` helper
- Exported selectors from stores
- Debug utility for clean logging

### Phase 4: Clean Code
- Query key factories
- Constants extraction (routes, messages)
- Custom hooks (useDialog)
- Memoization with useCallback

### Phase 5: Internationalization
- Added next-intl (4 languages)
- Language switcher component
- 96+ translation keys
- Cookie-based locale detection

---

## Future Enhancements

### Short Term
- [ ] Add unit test coverage
- [ ] Implement error boundary components
- [ ] Add loading indicators for mutations
- [ ] Create Storybook for components

### Medium Term
- [ ] Implement offline support (PWA)
- [ ] Add analytics tracking
- [ ] Performance monitoring
- [ ] SEO optimization

### Long Term
- [ ] Micro-frontend migration (if needed)
- [ ] GraphQL adoption (if beneficial)
- [ ] Mobile apps (React Native code sharing)
- [ ] Admin dashboard

---

## Conclusion

This architecture provides a solid foundation for:
- ✅ Scalability (monorepo with shared packages)
- ✅ Maintainability (clean code, DRY principles)
- ✅ Type Safety (100% TypeScript)
- ✅ Developer Experience (consistent patterns, great tooling)
- ✅ Performance (optimized builds, caching, memoization)
- ✅ Internationalization (4 languages out of the box)

The codebase follows industry best practices and is ready for production deployment.

---

**Last Updated:** 2025-10-11
**Architecture Version:** 2.0
**Status:** Production-Ready
