# Architecture & Code Organization

## Feature-Sliced Design

Both apps follow a strict feature-based structure:

```
src/
├── app/                    # Next.js App Router (routes)
├── features/               # Domain-driven feature modules
│   ├── auth/
│   │   ├── components/     # Feature-specific UI components
│   │   ├── constants/      # Feature constants (*.constants.ts)
│   │   ├── hooks/          # Custom React hooks (use*.ts)
│   │   ├── queries/        # React Query key factories (*.keys.ts)
│   │   ├── schemas/        # Zod validation schemas (*.schemas.ts)
│   │   ├── services/       # API service functions (*.service.ts)
│   │   ├── store/          # Zustand state management (*.store.ts)
│   │   └── types/          # Feature-specific types ONLY (*.types.ts)
│   ├── menu/
│   ├── orders/
│   └── [other-features]/
├── common/                 # Shared app-level utilities
│   ├── components/         # Shared UI widgets
│   ├── constants/          # Routes, error messages, etc.
│   ├── hooks/              # Reusable hooks
│   ├── services/           # Common API services
│   └── types/              # Shared types
├── utils/                  # App-level utilities (apiFetch config)
└── i18n/                   # next-intl localization config
```

**POS Features:** auth, menu, orders, kitchen, tables, payments, discounts, reports, user, personnel, admin, store, subscription, tiers, audit-logs

**SOS Features:** menu, cart, session, store

## File Naming Conventions

| Type       | Convention        | Example                 |
| ---------- | ----------------- | ----------------------- |
| Components | PascalCase.tsx    | `CategoryCard.tsx`      |
| Constants  | `*.constants.ts`  | `print.constants.ts`    |
| Hooks      | `use*.ts`         | `useProtected.ts`       |
| Query Keys | `*.keys.ts`       | `menu.keys.ts`          |
| Schemas    | `*.schemas.ts`    | `print.schemas.ts`      |
| Services   | `*.service.ts`    | `category.service.ts`   |
| Stores     | `*.store.ts`      | `auth.store.ts`         |
| Types      | `*.types.ts`      | `menu-item.types.ts`    |
| Utils      | kebab-case.ts     | `format-currency.ts`    |

### Types Files Convention

**Types files (`*.types.ts`) should ONLY export types and interfaces - never constants or runtime values.**

```typescript
// ✅ CORRECT - types file exports only types
// features/print/types/print.types.ts
export type PrintJobType = 'CUSTOMER_RECEIPT' | 'KITCHEN_TICKET';
export interface PrintSettings { /* ... */ }

// ❌ WRONG - exporting constants from types file
export const DEFAULT_PRINT_SETTINGS = { /* ... */ };  // Move to constants/
export const printSettingsSchema = z.object({});       // Move to schemas/
```

**Where to put runtime values:**

| Type of Export | File Location | Example |
| -------------- | ------------- | ------- |
| Types, interfaces | `types/*.types.ts` | `PrintSettings`, `PrintJob` |
| Constants, default values | `constants/*.constants.ts` | `DEFAULT_PRINT_SETTINGS` |
| Zod schemas | `schemas/*.schemas.ts` | `printSettingsSchema` |
| Zod-inferred types | `schemas/*.schemas.ts` | `type FormValues = z.infer<typeof schema>` |

## Import Organization

Standard file organization for all components and modules:

```typescript
'use client';

// 1. React & Next.js imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Shared packages
import { Button } from '@repo/ui/components/button';

// 4. Feature imports
import { useAuthStore } from '@/features/auth/store/auth.store';

// 5. Common utilities
import { ROUTES } from '@/common/constants/routes';

// 6. Types (last)
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

## Important Files & Locations

- **API client config:** `apps/*/src/utils/apiFetch.ts`
- **Auto-generated types:** `packages/api/src/generated/types.gen.ts`
- **Shared components:** `packages/ui/src/components/`
- **Translation files:** `messages/[locale]/*.json`
- **Global styles:** `packages/ui/src/styles/globals.css`
- **Semantic color tokens:** `packages/ui/src/styles/globals.css`
- **i18n config:** `apps/*/src/i18n/`
- **Socket providers:** `apps/*/src/utils/socket-provider.tsx`

## Socket.IO Implementation

Both apps use Socket.IO for real-time features:

**POS:** Kitchen order updates, order status changes
**SOS:** Real-time cart synchronization across devices

Socket providers are configured in:

- `apps/restaurant-management-system/src/utils/socket-provider.tsx`
- `apps/self-ordering-system/src/utils/socket-provider.tsx`

Sockets are initialized with namespace patterns and use modular event handlers.
