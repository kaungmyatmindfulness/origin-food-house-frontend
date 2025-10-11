# OpenAPI TypeScript Code Generation

This document explains the OpenAPI-based TypeScript type generation setup for the Origin Food House project.

## Overview

The project uses [@hey-api/openapi-ts](https://openapi-ts.dev/) to automatically generate TypeScript types from the backend's OpenAPI specification. This provides:

- **Type safety**: All API request/response types are automatically generated
- **Single source of truth**: Backend OpenAPI spec drives frontend types
- **Auto-completion**: Full IDE support for API calls
- **Reduced errors**: Catch type mismatches at compile time

## Setup

The code generation is configured in `packages/api/` workspace package.

### Files Created

```
packages/api/
├── openapi-ts.config.ts          # Configuration for openapi-ts
├── scripts/
│   └── fetch-and-generate.sh     # Script to fetch spec and generate types
├── src/generated/                # Auto-generated files (committed to git)
│   ├── types.gen.ts              # All TypeScript types
│   ├── sdk.gen.ts                # Generated SDK (not used)
│   ├── client.gen.ts             # Client configuration
│   └── index.ts                  # Main export
├── openapi-spec.json             # Downloaded spec (gitignored)
├── openapi-spec-fixed.json       # Fixed spec (gitignored)
└── README.md                     # Usage documentation
```

## Usage

### Regenerating Types

When the backend API changes, regenerate the TypeScript types:

```bash
# From project root
npm run generate:api

# Or from packages/api
cd packages/api && npm run generate
```

**Requirements:**
- Backend must be running at `http://localhost:3000`
- Python 3 must be installed (for fixing OpenAPI spec issues)

### Using Generated Types in Services

```typescript
// features/menu/services/category.service.ts
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';

export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
  const res = await apiFetch<CategoryResponseDto[]>({
    path: '/categories',
    query: { storeId },
  });

  return unwrapData(res, 'Failed to retrieve categories');
}

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

### Using Generated Types in Components

```typescript
'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { MenuItemResponseDto } from '@repo/api/generated/types';
import { getMenuItems } from '@/features/menu/services/menu.service';

export function MenuList({ storeId }: { storeId: string }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ['menu-items', storeId],
    queryFn: () => getMenuItems(storeId),
  });

  // `items` is typed as MenuItemResponseDto[]
  return (
    <div>
      {items?.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.basePrice}</p>
        </div>
      ))}
    </div>
  );
}
```

## Architecture

### Why Not Use the Generated SDK?

The generated SDK (`sdk.gen.ts`) provides typed functions for all endpoints, but we don't use them directly because:

1. **Custom error handling**: Our `apiFetch` utility has custom error handling with toast notifications
2. **Auth integration**: `apiFetch` handles HttpOnly cookies and auto-logout on 401
3. **Query string support**: Our implementation uses `qs` for complex query parameters
4. **Consistent patterns**: Existing codebase uses service functions with `apiFetch`

Instead, we:
- **Use the generated types** (`types.gen.ts`) for request/response typing
- **Keep using `apiFetch`** for making requests with custom error handling
- **Best of both worlds**: Type safety + custom functionality

### Workflow

1. Backend developer updates API
2. Frontend developer runs `npm run generate:api`
3. Script fetches OpenAPI spec from `http://localhost:3000/api-docs-json`
4. Script fixes common issues (e.g., invalid `$ref` to `String`)
5. openapi-ts generates TypeScript types
6. New types are available in `@repo/api/generated/types`

## Configuration

### openapi-ts.config.ts

```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: './openapi-spec-fixed.json',
  output: {
    format: 'prettier',
    path: './src/generated',
  },
  types: {
    enums: 'javascript',
  },
});
```

### Package Scripts

```json
{
  "scripts": {
    "generate": "./scripts/fetch-and-generate.sh",
    "generate:only": "openapi-ts"
  }
}
```

- `generate`: Fetches spec from backend, fixes issues, and generates types
- `generate:only`: Only runs code generation (uses existing spec file)

## Common Issues

### Backend not running

```
❌ Failed to fetch OpenAPI spec. Make sure backend is running at http://localhost:3000
```

**Solution**: Start the backend server before running generation.

### Invalid OpenAPI spec

The script automatically fixes common issues:
- Invalid `$ref` to `#/components/schemas/String`

If other issues occur, check the error log in `openapi-ts-error-*.log`.

### Import errors

Make sure to use type imports:

```typescript
// ✅ Correct
import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ Wrong
import { CategoryResponseDto } from '@repo/api/generated/types';
```

## Migration Guide

### Existing Services

To migrate existing services to use generated types:

**Before:**
```typescript
interface Category {
  id: string;
  name: string;
  storeId: string;
  // ... manual type definition
}

export async function getCategories(storeId: string): Promise<Category[]> {
  // ...
}
```

**After:**
```typescript
import type { CategoryResponseDto } from '@repo/api/generated/types';

export async function getCategories(
  storeId: string
): Promise<CategoryResponseDto[]> {
  // Same implementation, just different type
}
```

## Maintenance

### When Backend API Changes

1. Update backend code
2. Regenerate OpenAPI spec (backend should do this automatically)
3. Run `npm run generate:api` in frontend
4. Fix any TypeScript errors in frontend code
5. Commit the updated generated files

### Keeping Types in Sync

- **DO** commit generated files (`src/generated/`)
- **DON'T** commit spec files (`openapi-spec*.json`)
- **DO** regenerate types when pulling backend changes
- **DON'T** manually edit generated files

## Benefits

✅ **Type Safety**: Catch API mismatches at compile time
✅ **Auto-Completion**: Full IDE support for all API types
✅ **Documentation**: Generated types serve as API documentation
✅ **Reduced Errors**: No more manual type definitions
✅ **Always in Sync**: Types match backend implementation

## Resources

- [openapi-ts Documentation](https://openapi-ts.dev/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Backend API Docs](http://localhost:3000/api-docs)
- [@repo/api README](packages/api/README.md)

---

**Origin Food House - Type-Safe API Integration**
