# @repo/api

Shared API utilities and TypeScript types for Origin Food House applications.

## Overview

This package provides:

- **API client utilities** (`apiFetch`) with error handling and auth integration
- **Auto-generated TypeScript types** from the backend OpenAPI specification
- **Shared services** (upload, etc.)

## Installation

This package is workspace-internal and automatically available to all apps in the monorepo.

```typescript
// In your app
import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';
import type {
  CategoryResponseDto,
  MenuItemResponseDto,
} from '@repo/api/generated/types';
```

## Core Utilities

### `apiFetch` - API Client

The `apiFetch` utility is a configured fetch wrapper with:

- Automatic error handling & toast notifications
- Auth integration (HttpOnly cookies)
- Query string support (using `qs`)
- Type-safe responses

#### Setup

```typescript
// apps/restaurant-management-system/src/utils/apiFetch.ts
import { createApiFetch, unwrapData } from '@repo/api/utils/apiFetch';
import { useAuthStore } from '@/features/auth/store/auth.store';

export const apiFetch = createApiFetch({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  onUnauthorized: () => useAuthStore.getState().clearAuth(),
});

export { unwrapData };
```

#### Usage with Generated Types

```typescript
// features/menu/services/category.service.ts
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';

/**
 * Fetches all categories for a store.
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

/**
 * Creates a new category.
 */
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

### `unwrapData` - Null-safe Data Extraction

Helper function to extract data from API responses with consistent null checking.

```typescript
import { unwrapData } from '@repo/api/utils/apiFetch';

const res = await apiFetch<User[]>('/users');
const users = unwrapData(res, 'Failed to fetch users'); // throws if data is null
```

## Generated Types

TypeScript types are auto-generated from the backend's OpenAPI specification.

### Available Types

All DTOs and response types from the backend are available:

```typescript
import type {
  // Auth
  LoginDto,
  ChooseStoreDto,

  // Users
  UserProfileResponseDto,
  CreateUserDto,

  // Categories
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,

  // Menu Items
  MenuItemResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,

  // Stores
  GetStoreDetailsResponseDto,
  CreateStoreDto,
  UpdateStoreInformationDto,

  // Tables
  TableResponseDto,
  CreateTableDto,
  BatchUpsertTableDto,

  // Cart
  CartResponseDto,
  AddItemToCartDto,

  // Standard Response
  StandardApiResponse,
} from '@repo/api/generated/types';
```

### Regenerating Types

When the backend API changes, regenerate types:

```bash
# From project root
npm run generate --workspace=@repo/api

# Or from packages/api
cd packages/api && npm run generate
```

**Note:** Make sure your backend is running at `http://localhost:3000` before regenerating.

## Error Handling

The `apiFetch` utility provides custom error classes:

```typescript
import {
  ApiError,
  UnauthorizedError,
  NetworkError,
} from '@repo/api/utils/apiFetch';

try {
  const data = await getCategories(storeId);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Handle 401 - user will be logged out automatically
  } else if (error instanceof ApiError) {
    // Handle other API errors (400, 403, 404, etc.)
    console.error(`API Error ${error.status}:`, error.message);
  } else if (error instanceof NetworkError) {
    // Handle network/connection errors
  }
}
```

**Note:** `apiFetch` automatically shows toast notifications for errors, so manual error handling is often unnecessary.

## Upload Service

Upload images using the shared upload service:

```typescript
import { createUploadService } from '@repo/api/services/upload.service';
import { apiFetch } from '@/utils/apiFetch';

const uploadService = createUploadService(apiFetch);

// Upload an image
const file: File = /* ... */;
const imageUrl = await uploadService.uploadImage(file);
```

## Best Practices

### 1. Always Use Types

```typescript
// ✅ Good - Explicit types
export async function getUser(id: string): Promise<UserProfileResponseDto> {
  const res = await apiFetch<UserProfileResponseDto>(`/users/${id}`);
  return unwrapData(res, 'Failed to fetch user');
}

// ❌ Bad - No types
export async function getUser(id: string) {
  const res = await apiFetch(`/users/${id}`);
  return res.data;
}
```

### 2. Use Query String Support

```typescript
// ✅ Good - Uses built-in query support
const res = await apiFetch<MenuItem[]>({
  path: '/menu-items',
  query: { storeId, categoryId },
});

// ❌ Bad - Manual query string construction
const res = await apiFetch<MenuItem[]>(
  `/menu-items?storeId=${storeId}&categoryId=${categoryId}`
);
```

### 3. Use `unwrapData` Helper

```typescript
// ✅ Good - Uses unwrapData
export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
  const res = await apiFetch<CategoryResponseDto[]>({
    path: '/categories',
    query: { storeId },
  });
  return unwrapData(res, 'Failed to retrieve categories');
}

// ❌ Bad - Manual null checking
export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
  const res = await apiFetch<CategoryResponseDto[]>({
    path: '/categories',
    query: { storeId },
  });
  if (res.data == null) {
    throw new Error('Failed to retrieve categories');
  }
  return res.data;
}
```

### 4. Add JSDoc Comments

```typescript
/**
 * Creates a new menu item for a specific store.
 *
 * @param storeId - The ID of the store.
 * @param data - The menu item data to create.
 * @returns A promise resolving to the created menu item ID.
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors.
 */
export async function createMenuItem(
  storeId: string,
  data: CreateMenuItemDto
): Promise<string> {
  const res = await apiFetch<string>('/menu-items', {
    method: 'POST',
    query: { storeId },
    body: JSON.stringify(data),
  });

  return unwrapData(res, 'Failed to create menu item');
}
```

## Type Exports

The package exports types in two ways:

### 1. Import from Generated Types (Recommended)

```typescript
import type {
  CategoryResponseDto,
  MenuItemResponseDto,
} from '@repo/api/generated/types';
```

### 2. Import from Specific Type Files

```typescript
import type {
  StandardApiResponse,
  ErrorDetail,
} from '@repo/api/types/api.types';

import type { UploadImageResponseData } from '@repo/api/types/upload.types';
```

## Architecture

```
packages/api/
├── src/
│   ├── generated/           # Auto-generated from OpenAPI spec
│   │   ├── types.gen.ts     # All TypeScript types
│   │   ├── sdk.gen.ts       # Generated SDK (not used)
│   │   └── index.ts         # Exports
│   ├── services/
│   │   └── upload.service.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   └── upload.types.ts
│   └── utils/
│       └── apiFetch.ts      # Core API client
├── openapi-spec-fixed.json  # Fixed OpenAPI spec
├── openapi-ts.config.ts     # Code generation config
└── package.json
```

## Troubleshooting

### Types are outdated

Regenerate types from the backend:

```bash
npm run generate --workspace=@repo/api
```

### Backend spec has errors

If the OpenAPI spec has issues (like invalid `$ref` pointers), the generation script will fix common issues automatically. The fixed spec is saved in `openapi-spec-fixed.json`.

### Import errors

Make sure you're using the correct import paths:

```typescript
// ✅ Correct
import { apiFetch } from '@repo/api/utils/apiFetch';
import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ Wrong
import { apiFetch } from '@repo/api/utils/apiFetch.ts';
import { CategoryResponseDto } from '@repo/api/generated/types';
```

## Contributing

When adding new shared API utilities:

1. Place them in the appropriate directory (`services/`, `types/`, or `utils/`)
2. Export them in `package.json` exports field
3. Update this README with usage examples
4. Regenerate types if backend API changes

---

**Origin Food House - Type-Safe API Integration**
