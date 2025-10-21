# Origin Food House - Frontend Monorepo

A modern, enterprise-grade restaurant management system built with **Next.js 15**, **React 19**, and **Turborepo**. Supports multi-language (English, Chinese, Myanmar, Thai) with clean architecture and type-safe patterns.

## 🏗️ Architecture Overview

This is a **Turborepo monorepo** containing two Next.js applications and shared packages:

```
origin-food-house-frontend/
├── apps/
│   ├── pos/          # Point of Sale System (Port 3002)
│   └── sos/          # Self-Ordering System (Port 3001)
├── packages/
│   ├── api/          # Shared API utilities & types
│   ├── ui/           # Shared UI components (shadcn/ui)
│   ├── eslint-config/
│   └── typescript-config/
└── messages/         # i18n translation files
```

---

## 📦 Applications

### **POS (Point of Sale)** - `@app/pos`

**Port:** 3002
**Users:** Restaurant staff (owners, admins, cashiers)

**Features:**

- Menu management (CRUD operations, drag-and-drop reordering)
- Table management with QR code generation
- Store settings and information
- Role-based access control (Owner, Admin, Staff)
- Multi-store support

### **SOS (Self-Ordering System)** - `@app/sos`

**Port:** 3001
**Users:** Customers

**Features:**

- Browse restaurant menu
- Real-time cart synchronization (Socket.IO)
- Table-based ordering via QR code
- Session-based checkout
- Optimistic UI updates

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm 11.6.2 (or use package manager of choice)

### Installation

```bash
# Install all dependencies
npm install

# Run both apps in development
npm run dev

# Run specific app
npm run dev --filter=@app/pos
npm run dev --filter=@app/sos
```

### Available Commands

```bash
# Development
npm run dev          # Run all apps
npm run build        # Build all apps
npm run lint         # Lint all packages
npm run check-types  # TypeScript type checking
npm run format       # Format code with Prettier

# API Type Generation
npm run generate:api # Generate TypeScript types from backend OpenAPI spec

# App-specific
turbo run dev --filter=@app/pos
turbo run build --filter=@app/sos
```

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 15** (App Router with Turbopack)
- **React 19**
- **TypeScript 5.8+**

### State Management

- **Zustand** (with immer, persist, devtools middleware)
- **React Query** (@tanstack/react-query) for server state

### Styling

- **Tailwind CSS v4** (@tailwindcss/postcss)
- **Motion** (Framer Motion alternative)
- **shadcn/ui** components via `@repo/ui`

### API & Data

- Custom `apiFetch` utility with error handling
- **Auto-generated TypeScript types** from OpenAPI spec (@hey-api/openapi-ts)
- **qs** for query string parsing
- **Socket.IO Client** (SOS only - real-time cart)

### Forms & Validation

- **react-hook-form**
- **Zod** validation

### i18n

- **next-intl** (English, Chinese, Myanmar, Thai)

### POS-Specific

- **@dnd-kit** (drag-and-drop menu reordering)
- **qrcode.react** (table QR code generation)
- **react-to-print** (receipt printing)

### SOS-Specific

- **socket.io-client** (real-time cart sync)
- **react-scroll** (smooth menu navigation)
- **decimal.js** (precise currency calculations)

---

## 📁 Shared Packages

### `@repo/api` ⭐ NEW

**Purpose:** Shared API utilities and auto-generated types

**Exports:**

- `createApiFetch()` - Configurable API client factory
- `unwrapData()` - Helper for null-safe data extraction
- **Auto-generated TypeScript types** from backend OpenAPI spec
- API error classes (`ApiError`, `UnauthorizedError`, `NetworkError`)
- `StandardApiResponse<T>` type
- Upload service factory

**Key Features:**

- ✅ **Auto-generated types** from backend OpenAPI specification
- ✅ Type-safe API requests and responses
- ✅ Eliminates code duplication between apps
- ✅ Dependency injection for auth handling
- ✅ Consistent error handling
- ✅ Single source of truth (backend spec → frontend types)

**Type Generation:**

```bash
# Regenerate types when backend API changes
npm run generate:api
```

See **`packages/api/README.md`** and **`OPENAPI_SETUP.md`** for details.

### `@repo/ui`

**Purpose:** Shared UI component library (shadcn/ui)

**Exports:**

- 40+ React components (Button, Dialog, Form, etc.)
- Custom hooks (`use-toast`, `use-mobile`)
- Utility functions (`cn()` via lib/utils)
- Global CSS with Tailwind configuration

### `@repo/eslint-config` & `@repo/typescript-config`

**Purpose:** Shared tooling configuration

---

## 🌍 Internationalization (i18n)

Both apps support **4 languages** with automatic locale detection:

| Language | Code | Native Name |
| -------- | ---- | ----------- |
| English  | `en` | English     |
| Chinese  | `zh` | 中文        |
| Myanmar  | `my` | မြန်မာ      |
| Thai     | `th` | ไทย         |

**Features:**

- ✅ Cookie-based locale persistence
- ✅ Clean URLs (no `/en/` prefixes)
- ✅ Language switcher component included
- ✅ 96+ translation keys across both apps
- ✅ Type-safe translation access

**Usage:**

```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
<button>{t('save')}</button>  // Auto-translates based on locale
```

See **`I18N_GUIDE.md`** for complete documentation.

---

## 🏛️ Architecture Patterns

### Feature-Sliced Design

Both apps follow a consistent feature-based structure:

```
src/
├── app/              # Next.js App Router (routes)
├── features/         # Domain-driven modules
│   ├── auth/
│   │   ├── components/   # Feature-specific UI
│   │   ├── services/     # API calls
│   │   ├── store/        # Zustand state
│   │   ├── types/        # TypeScript types
│   │   ├── hooks/        # Custom hooks
│   │   └── queries/      # React Query key factories
│   ├── menu/
│   └── [feature]/
├── common/           # Shared app utilities
│   ├── components/   # Shared widgets
│   ├── constants/    # Routes, error messages
│   ├── hooks/        # Reusable hooks
│   ├── services/     # Common API services
│   └── types/        # Shared types
├── utils/            # Utilities (apiFetch config)
└── i18n/             # Localization config
```

### Key Principles

1. **Single Responsibility** - Each module handles one domain
2. **DRY (Don't Repeat Yourself)** - Shared code in `@repo/api`
3. **Type Safety** - 100% TypeScript, no `any` types
4. **Separation of Concerns** - Services, state, UI separated
5. **Consistent Naming** - `*.service.ts`, `*.store.ts`, `*.types.ts`

---

## 🔧 Development Guidelines

### API Service Pattern (with Auto-Generated Types)

```typescript
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { CategoryResponseDto } from '@repo/api/generated/types';

/**
 * Fetches all categories for a store.
 *
 * @param storeId - The ID of the store
 * @returns Promise resolving to array of categories
 */
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

**Benefits:**

- ✅ Types are auto-generated from backend OpenAPI spec
- ✅ Catch API mismatches at compile time
- ✅ Full IDE auto-completion support
- ✅ No manual type maintenance required

### Query Key Factories

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,
  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,
};

// Usage in components
const { data } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});
```

### State Management

```typescript
// Minimal global state with Zustand
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
      })),
      { name: 'auth-storage' }
    )
  )
);

// Export selectors for performance
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
```

### Skeleton Loading States

```typescript
if (isLoading) {
  return <MenuSkeleton />;
}

return <MenuContent data={data} />;
```

---

## 📚 Documentation

- **`CLAUDE.md`** - Project instructions for AI assistants
- **`OPENAPI_SETUP.md`** - OpenAPI TypeScript code generation guide ⭐ NEW
- **`I18N_GUIDE.md`** - Complete i18n usage guide
- **`packages/api/README.md`** - API package usage documentation
- **`apps/pos/README.md`** - POS app technical details
- **`apps/sos/README.md`** - SOS app technical details

---

## 🧪 Quality Assurance

### Type Checking

```bash
npm run check-types        # All packages
npm run check-types --workspace=@app/pos
```

### Linting

```bash
npm run lint              # All packages (max 0 warnings)
npm run lint --filter=@app/sos
```

### Code Formatting

```bash
npm run format            # Format all .ts/.tsx/.md files
```

---

## 📊 Project Stats

| Metric                     | Value        |
| -------------------------- | ------------ |
| **Apps**                   | 2 (POS, SOS) |
| **Shared Packages**        | 4            |
| **Languages Supported**    | 4            |
| **TypeScript Files (POS)** | 65+          |
| **TypeScript Files (SOS)** | 37+          |
| **Translation Keys**       | 96+          |
| **UI Components**          | 40+          |

---

## 🔑 Key Features

### Shared Infrastructure

✅ **Auto-generated TypeScript types from OpenAPI spec** ⭐ NEW
✅ Centralized API utilities (`@repo/api`)
✅ Shared UI component library (`@repo/ui`)
✅ Type-safe API requests & responses
✅ Automatic error handling with toast notifications
✅ Query key factories for React Query
✅ Debug utility for environment-aware logging

### POS Features

✅ Cookie-based authentication
✅ Multi-store management
✅ Drag-and-drop menu reordering
✅ QR code generation for tables
✅ Role-based access control
✅ Receipt printing

### SOS Features

✅ Real-time cart synchronization
✅ Optimistic UI updates
✅ Session-based ordering
✅ Table QR code scanning
✅ Smooth menu navigation
✅ Precise decimal calculations

### Developer Experience

✅ Turborepo for fast builds
✅ Hot module replacement with Turbopack
✅ Comprehensive TypeScript coverage
✅ Custom hooks library
✅ Query key factories
✅ Environment-aware debug logging

---

## 🌟 Recent Improvements

### Phase 1: Shared API Package

- Created `@repo/api` to eliminate ~380 lines of duplicated code
- Factory pattern for configurable API clients
- Consistent error handling across apps

### Phase 2: Naming Standardization

- Standardized folder names (`components/`, `store/`)
- Unified service file naming (`.service.ts`)
- Consistent structure across features

### Phase 3: Type Safety & Code Quality

- Added proper return types to all services
- Created `unwrapData()` helper for null checking
- Added selector exports to all stores
- Debug utility for production-safe logging

### Phase 4: Clean Code Patterns

- Query key factories for type-safe caching
- Constants extraction (routes, error messages)
- Custom hooks (`useDialog`, `useDialogState`)
- Memoized callbacks with `useCallback`

### Phase 5: Internationalization

- Multi-language support (4 languages)
- `LanguageSwitcher` component
- 96+ translation keys
- Cookie-based locale detection

### Phase 6: OpenAPI TypeScript Code Generation ⭐ NEW

- **Auto-generated types** from backend OpenAPI specification
- Uses `@hey-api/openapi-ts` for code generation
- 50+ DTOs and response types auto-generated
- Automated fetch + fix + generate script
- Single source of truth (backend → frontend types)
- Eliminates manual type maintenance
- Full IDE support with auto-completion

---

## 🚦 Environment Variables

Create `.env` files in each app directory:

### POS App (`apps/pos/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### SOS App (`apps/sos/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🤝 Contributing

1. Follow the feature-sliced architecture
2. Use TypeScript with strict mode
3. **Use auto-generated types** from `@repo/api/generated/types` ⭐ NEW
4. Write services that return typed data
5. Use query key factories for React Query
6. Add translations for all 4 languages
7. Export selectors for Zustand stores
8. Use `unwrapData()` for null checking
9. Follow naming conventions (`.service.ts`, not `.services.ts`)
10. Regenerate types after backend API changes (`npm run generate:api`)

---

## 📖 Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

## 📄 License

Private - Origin Food House

---

## 🎯 Next Steps

- Integrate with backend API
- Add test coverage (Jest + React Testing Library)
- Set up CI/CD pipeline
- Implement E2E tests (Playwright)
- Add Storybook for component documentation

---

**Built with ❤️ for Origin Food House**
