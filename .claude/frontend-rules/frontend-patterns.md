# Frontend Patterns

This guide covers API calls, state management, navigation, and internationalization.

---

## API Calls with $api Hooks

**ALWAYS use `$api.useQuery()` and `$api.useMutation()` for API calls:**

### Query Pattern (GET)

```typescript
import { $api } from '@/utils/apiFetch';

function CategoryList({ storeId }: { storeId: string }) {
  const { data: response, isLoading, error } = $api.useQuery(
    'get',
    '/stores/{storeId}/categories',
    { params: { path: { storeId } } },
    { enabled: !!storeId, staleTime: 30 * 1000 }
  );

  // Extract data from StandardApiResponse
  const categories = response?.data ?? [];

  if (isLoading) return <Skeleton />;
  return <CategoryGrid categories={categories} />;
}
```

### Mutation Pattern (POST/PATCH/DELETE)

```typescript
import { $api } from '@/utils/apiFetch';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

function CreateCategoryForm({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();

  const createMutation = $api.useMutation('post', '/stores/{storeId}/categories', {
    onSuccess: () => {
      toast.success('Category created successfully');
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
    <Button onClick={() => handleSubmit(formData)} disabled={createMutation.isPending}>
      {createMutation.isPending ? 'Creating...' : 'Create'}
    </Button>
  );
}
```

### Key Points

- `$api.useQuery` returns `{ data: StandardApiResponse<T> }` - actual data in `response?.data`
- Mutation signature: `mutation.mutate({ params: { path, query }, body })`
- Error typing: `(error: unknown)` since OpenAPI doesn't define errors

### Deprecated (DO NOT USE)

```typescript
// ❌ WRONG - Service functions are deprecated
import { getCategories } from '@/features/menu/services/category.service';

const { data } = useQuery({
  queryKey: ['categories', storeId],
  queryFn: () => getCategories(storeId),
});
```

---

## Query Key Factories

```typescript
// features/menu/queries/menu.keys.ts
export const menuKeys = {
  all: ['menu'] as const,
  categories: (storeId: string) =>
    [...menuKeys.all, 'categories', { storeId }] as const,
  category: (storeId: string, categoryId: string) =>
    [...menuKeys.categories(storeId), categoryId] as const,
  items: (storeId: string) => [...menuKeys.all, 'items', { storeId }] as const,
};

// Usage
queryClient.invalidateQueries({ queryKey: menuKeys.all }); // All menu data
queryClient.invalidateQueries({ queryKey: menuKeys.categories(storeId) }); // Specific store
```

---

## Zustand State Management

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
        selectedStoreId: null,
        isAuthenticated: false,

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

// Usage
const storeId = useAuthStore(selectSelectedStoreId);
```

---

## Navigation: Link vs Button

**Use `<Link>` for navigation, `<Button>` for actions.**

### Link Button Pattern (Recommended)

```typescript
// ✅ CORRECT - Link for navigation
<Button variant="outline" size="lg" asChild>
  <Link href="/store/create">
    <Plus className="mr-2 h-5 w-5" />
    Create New Store
  </Link>
</Button>

// ❌ WRONG - Button onClick for navigation
<Button onClick={() => router.push('/store/create')}>Create New Store</Button>
```

### When to Use Link

```typescript
// Simple navigation
<Button asChild>
  <Link href="/menu">View Menu</Link>
</Button>

// External link
<Button asChild>
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    Learn More
  </Link>
</Button>
```

### When to Use Button onClick

```typescript
// Form submission
<Button onClick={handleSubmit} type="submit">Save</Button>

// Opening dialog
<Button onClick={() => setIsOpen(true)}>Open Dialog</Button>

// Complex logic before navigation
<Button onClick={async () => {
  await saveData();
  router.push('/dashboard');
}}>Save and Continue</Button>
```

### Router Methods

```typescript
// Programmatic navigation after action
router.push('/dashboard');

// Redirect (no history entry)
router.replace('/store/create');

// Go back
router.back();
```

### Decision Tree

```
User-initiated navigation?
├─ YES → Simple? → Use <Link> (with Button asChild)
│        Complex logic first? → Button onClick + router.push()
└─ NO → Redirect? → router.replace()
        After action? → router.push()
        Go back? → router.back()
```

---

## Internationalization (i18n)

**All 4 languages required:** `en`, `zh`, `my`, `th`

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('pageTitle')}</h1>
      <Button>{t('save')}</Button>
      <p className="text-muted-foreground">{t('description')}</p>
    </div>
  );
}
```

### RMS Locale Routing (Cookie-Based)

RMS uses cookie-based locale (NO locale in URLs):

```typescript
// ✅ CORRECT - No locale prefix
<Link href="/hub/menu">Menu</Link>
router.push('/store/create');

// ❌ WRONG - Don't include locale
<Link href={`/${locale}/hub/menu`}>Menu</Link>
```

### Translation Files

```
messages/
├── en/                    # 16 feature files
│   ├── common.json
│   ├── auth.json
│   ├── menu.json
│   └── ...
├── zh/
├── my/
└── th/
```

### Adding Translations

1. Identify feature domain (e.g., `store.json`)
2. Add to ALL 4 locales:

```json
// messages/en/store.json
{ "store": { "choose": { "createNewStore": "Create New Store" } } }

// messages/zh/store.json
{ "store": { "choose": { "createNewStore": "创建新店铺" } } }

// messages/my/store.json
{ "store": { "choose": { "createNewStore": "စတိုးအသစ်ဖန်တီးရန်" } } }

// messages/th/store.json
{ "store": { "choose": { "createNewStore": "สร้างร้านใหม่" } } }
```

### No Hardcoded Strings

```typescript
// ❌ BAD
<h1>Menu Management</h1>
<Button>Save Changes</Button>
{error && <p>Something went wrong</p>}

// ✅ GOOD
<h1>{t('title')}</h1>
<Button>{t('save')}</Button>
{error && <p>{t('error')}</p>}
```

**Exceptions:** Code identifiers, URLs, console logs, database values

---

## Performance Optimization

### Memoization

```typescript
// Memoize expensive calculations
const totalPrice = useMemo(
  () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  [items]
);

// Memoize callbacks passed to children
const handleDelete = useCallback(
  (id: string) => {
    deleteItem(id);
  },
  [deleteItem]
);
```

### Query Stale Time

```typescript
// Rarely changing data - longer stale time
const { data } = useQuery({
  queryKey: ['stores'],
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Frequently changing data - shorter stale time
const { data } = useQuery({
  queryKey: ['orders'],
  staleTime: 30 * 1000, // 30 seconds
});
```

### Debounce User Input

```typescript
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

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateMenuItem,
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: menuKeys.items(storeId) });
    const previousItems = queryClient.getQueryData(menuKeys.items(storeId));

    queryClient.setQueryData(menuKeys.items(storeId), (old) =>
      old?.map((item) =>
        item.id === variables.id ? { ...item, ...variables } : item
      )
    );

    return { previousItems };
  },
  onError: (_err, _variables, context) => {
    queryClient.setQueryData(menuKeys.items(storeId), context?.previousItems);
    toast.error('Failed to update');
  },
});
```

---

## Error Handling

```typescript
// ✅ GOOD - User-friendly messages
try {
  await createMenuItem(data);
  toast.success('Menu item created successfully');
} catch (error) {
  toast.error('Failed to create menu item', {
    description: error instanceof Error
      ? error.message
      : 'Please check your input and try again',
  });
}

// ❌ BAD - Generic error
catch (error) {
  toast.error('Error');
}
```

---

## Security

### Zod Validation

```typescript
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0),
});

const validated = categorySchema.parse(data);
```

### Prevent XSS

```typescript
// ❌ BAD - Never use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD
<div>{userInput}</div>
```

### Environment Variables

```typescript
// Only NEXT_PUBLIC_* exposed to client
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Server-side only (no NEXT_PUBLIC prefix)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
```
