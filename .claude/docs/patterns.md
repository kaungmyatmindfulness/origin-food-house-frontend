# Critical Patterns

## 1. API Calls with $api React Query Hooks

**ALWAYS use `$api.useQuery()` and `$api.useMutation()` for API calls in RMS:**

The `$api` client provides type-safe React Query hooks generated from the OpenAPI specification. This is the **only** pattern to use for API calls - service functions are deprecated.

### Query Pattern (GET requests)

```typescript
import { $api } from '@/utils/apiFetch';
import { useQueryClient } from '@tanstack/react-query';

function CategoryList({ storeId }: { storeId: string }) {
  // ✅ CORRECT - Use $api.useQuery for data fetching
  const { data: response, isLoading, error } = $api.useQuery(
    'get',
    '/stores/{storeId}/categories',
    { params: { path: { storeId } } },
    { enabled: !!storeId, staleTime: 30 * 1000 }
  );

  // Extract data from wrapped response (StandardApiResponse)
  const categories = response?.data ?? [];

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <CategoryGrid categories={categories} />;
}
```

### Mutation Pattern (POST/PATCH/DELETE requests)

```typescript
import { $api } from '@/utils/apiFetch';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

function CreateCategoryForm({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();

  // ✅ CORRECT - Use $api.useMutation for mutations
  const createMutation = $api.useMutation('post', '/stores/{storeId}/categories', {
    onSuccess: () => {
      toast.success('Category created successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['get', '/stores/{storeId}/categories'] });
    },
    onError: (error: unknown) => {
      toast.error('Failed to create category', {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const handleSubmit = (data: CreateCategoryDto) => {
    createMutation.mutate({
      params: { path: { storeId } },
      body: data,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Category'}
      </Button>
    </form>
  );
}
```

### Key Points

- **Use `$api` from `@/utils/apiFetch`** - configured with auth headers and error handling
- **Response structure**: `$api.useQuery` returns `{ data: StandardApiResponse<T> }` - actual data is in `response?.data`
- **Mutation call signature**: `mutation.mutate({ params: { path, query }, body })`
- **Error typing**: Use `(error: unknown)` in callbacks since OpenAPI doesn't define error types
- Import types **directly** from `@repo/api/generated/types` (NEVER manually define API types)

### Deprecated Pattern (DO NOT USE)

```typescript
// ❌ WRONG - Service functions are deprecated
import {
  getCategories,
  createCategory,
} from '@/features/menu/services/category.service';

const { data } = useQuery({
  queryKey: ['categories', storeId],
  queryFn: () => getCategories(storeId),
});

// ❌ WRONG - Manual useMutation with service function
const mutation = useMutation({
  mutationFn: (data) => createCategory(storeId, data),
});
```

### Type Import Pattern

```typescript
// ✅ CORRECT - Direct import from generated types
import type { CategoryResponseDto } from '@repo/api/generated/types';

// ❌ WRONG - Import from feature type file
import type { Category } from '@/features/menu/types/category.types';

// ✅ CORRECT - Let TypeScript infer the response type
const categories = response?.data ?? [];

// ❌ WRONG - Type casting bypasses TypeScript safety
const categories = (response?.data ?? []) as CategoryResponseDto[];
```

## 2. React Query Key Factories

Create hierarchical query key factories for type-safe caching:

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,

  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,

  category: (storeId: string, categoryId: string) =>
    [...menuKeys.categories(storeId), categoryId] as const,

  items: (storeId: string) => [...menuKeys.all, 'items', { storeId }] as const,

  item: (storeId: string, itemId: string) =>
    [...menuKeys.items(storeId), itemId] as const,
};

// Usage in components
const { data: categories } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});

// Hierarchical invalidation
queryClient.invalidateQueries({ queryKey: menuKeys.all }); // All menu data
queryClient.invalidateQueries({ queryKey: menuKeys.categories(storeId) }); // Specific store
```

## 3. Zustand State Management

**Use Zustand ONLY for global client state. Use React Query for server state.**

```typescript
// features/auth/store/auth.store.ts
interface AuthState {
  selectedStoreId: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setSelectedStore: (id: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        selectedStoreId: null,
        isAuthenticated: false,

        // Actions
        setSelectedStore: (id) =>
          set((draft) => {
            draft.selectedStoreId = id;
          }),

        clearAuth: () =>
          set((draft) => {
            draft.selectedStoreId = null;
            draft.isAuthenticated = false;
          }),
      })),
      { name: 'auth-storage' }
    ),
    { name: 'auth-store' }
  )
);

// ALWAYS export selectors
export const selectSelectedStoreId = (state: AuthState) =>
  state.selectedStoreId;
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;

// Usage in components
const storeId = useAuthStore(selectSelectedStoreId);
```

## 4. Error Handling Pattern

**User-Friendly Error Messages:**

```typescript
// ✅ GOOD
try {
  await createMenuItem(data);
  toast.success('Menu item created successfully');
} catch (error) {
  toast.error('Failed to create menu item', {
    description:
      error instanceof Error
        ? error.message
        : 'Please check your input and try again',
  });
}

// ❌ BAD
try {
  await createMenuItem(data);
} catch (error) {
  toast.error('Error');
}
```

## 5. Optimistic Updates

```typescript
// ✅ GOOD - Optimistic update pattern
const mutation = useMutation({
  mutationFn: updateMenuItem,
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: menuKeys.items(storeId) });

    // Snapshot previous value
    const previousItems = queryClient.getQueryData(menuKeys.items(storeId));

    // Optimistically update
    queryClient.setQueryData(menuKeys.items(storeId), (old) =>
      old?.map((item) =>
        item.id === variables.id ? { ...item, ...variables } : item
      )
    );

    return { previousItems };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(menuKeys.items(storeId), context?.previousItems);
    toast.error('Failed to update item');
  },
  onSuccess: () => {
    toast.success('Item updated successfully');
  },
});
```

## 6. Performance Optimization

### Memoization

```typescript
// ✅ GOOD - Memoize expensive calculations
const totalPrice = useMemo(
  () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  [items]
);

// ✅ GOOD - Memoize callbacks passed to child components
const handleDelete = useCallback(
  (id: string) => {
    deleteItem(id);
  },
  [deleteItem]
);

// ❌ BAD - Unnecessary memoization
const userName = useMemo(() => user.name, [user]);
```

### Query Stale Time

```typescript
// ✅ GOOD - Longer stale time for rarely changing data
const { data: stores } = useQuery({
  queryKey: ['stores'],
  queryFn: getStores,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ✅ GOOD - Shorter stale time for frequently changing data
const { data: orders } = useQuery({
  queryKey: ['orders'],
  queryFn: getOrders,
  staleTime: 30 * 1000, // 30 seconds
});
```

### Debounce User Input

```typescript
// ✅ GOOD
import { useDebouncedValue } from '@/hooks/use-debounced-value';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => searchItems(debouncedSearch),
    enabled: debouncedSearch.length > 2,
  });
}
```

## 7. Security Best Practices

### Sanitize User Input

```typescript
// ✅ GOOD - Zod validation
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0),
});

function createCategory(data: unknown) {
  const validated = categorySchema.parse(data);
  // Use validated data
}
```

### Prevent XSS

```typescript
// ❌ BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Avoid dangerouslySetInnerHTML entirely
<div>{userInput}</div>
```

### Environment Variables

```typescript
// ❌ BAD - Secret exposed to client
const API_SECRET = 'secret-key-123';

// ✅ GOOD - Only NEXT_PUBLIC_* vars are exposed to client
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ GOOD - Server-side only (no NEXT_PUBLIC prefix)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
```
