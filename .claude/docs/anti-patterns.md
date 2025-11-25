# Common Anti-Patterns to Avoid

## 1. Prop Drilling

```typescript
// ❌ BAD - Prop drilling
<Parent>
  <Child1 user={user}>
    <Child2 user={user}>
      <GrandChild user={user} />
    </Child2>
  </Child1>
</Parent>

// ✅ GOOD - Context or Zustand
const user = useAuthStore((state) => state.user);
```

## 2. Magic Numbers

```typescript
// ❌ BAD
if (items.length > 50) {
  toast.warning('Too many items');
}

// ✅ GOOD
const MAX_ITEMS_PER_ORDER = 50;

if (items.length > MAX_ITEMS_PER_ORDER) {
  toast.warning(`Maximum ${MAX_ITEMS_PER_ORDER} items allowed`);
}
```

## 3. Deeply Nested Conditionals

```typescript
// ❌ BAD
if (user) {
  if (user.isAuthenticated) {
    if (user.role === 'ADMIN') {
      if (user.permissions.includes('DELETE')) {
        return <DeleteButton />;
      }
    }
  }
}

// ✅ GOOD - Early returns
if (!user?.isAuthenticated) return null;
if (user.role !== 'ADMIN') return null;
if (!user.permissions.includes('DELETE')) return null;

return <DeleteButton />;
```

## 4. Large Catch Blocks

```typescript
// ❌ BAD
try {
  await createItem();
  await updateInventory();
  await sendNotification();
} catch (error) {
  // Which operation failed?
  toast.error('Operation failed');
}

// ✅ GOOD - Specific error handling
try {
  await createItem();
} catch (error) {
  toast.error('Failed to create item');
  return;
}

try {
  await updateInventory();
} catch (error) {
  toast.error('Failed to update inventory');
}
```

## 5. Using `any` Type

```typescript
// ❌ BAD
function handleError(error: any) {
  console.error(error.message);
}

// ✅ GOOD
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('An unknown error occurred');
  }
}
```

## 6. Manual Type Definitions for API Data

```typescript
// ❌ BAD - Manual type definition
interface Category {
  id: string;
  name: string;
  storeId: string;
}

// ✅ GOOD - Auto-generated type
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

## 7. Raw Tailwind Colors

```typescript
// ❌ BAD - Raw colors
<div className="bg-white text-gray-900">
<p className="text-gray-500">
<Card className="border-gray-200">

// ✅ GOOD - Semantic tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">
<Card className="border-border">
```

## 8. Arbitrary Values in CSS

```typescript
// ❌ BAD - Arbitrary values
<div className="pt-[23px] pb-[17px] pl-[31px]">
<h1 className="text-[32px] font-black leading-[1.2]">
<div className="grid grid-cols-[200px,1fr,300px] gap-[17px]">

// ✅ GOOD - Design system values
<div className="p-6">
<h1 className="text-3xl font-bold">
<div className="grid gap-4 md:grid-cols-3">
```

## 9. Button for Navigation

```typescript
// ❌ BAD - Button with onClick for navigation
<Button
  variant="outline"
  onClick={() => router.push('/store/create')}
>
  Create New Store
</Button>

// ✅ GOOD - Link for navigation
<Button variant="outline" asChild>
  <Link href="/store/create">
    Create New Store
  </Link>
</Button>
```

## 10. Locale in URL Routes (RMS)

```typescript
// ❌ BAD - Don't include locale in RMS routes
<Link href={`/${locale}/hub/menu`}>Menu</Link>
router.push(`/${locale}/store/create`);

// ✅ GOOD - Cookie-based locale (middleware handles it)
<Link href="/hub/menu">Menu</Link>
router.push('/store/create');
```

## 11. Inline Type Annotations for Props

```typescript
// ❌ BAD - Inline type annotation
export function CategoryCard({
  category,
  onEdit,
}: {
  category: CategoryResponseDto;
  onEdit: (id: string) => void;
}) {
  // ...
}

// ✅ GOOD - Named interface
interface CategoryCardProps {
  category: CategoryResponseDto;
  onEdit: (id: string) => void;
}

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
  // ...
}
```

## 12. Overriding Component Props with Custom Classes

```typescript
// ❌ BAD - Custom classes override component styling
<Button className="bg-red-600 hover:bg-red-700 h-12 px-6">Delete</Button>
<Badge className="bg-green-500 text-white">Active</Badge>

// ✅ GOOD - Use variant props
<Button variant="destructive" size="lg">Delete</Button>
<Badge variant="default">Active</Badge>
```

## 13. Mixing Server and Client State

```typescript
// ❌ BAD - Storing server data in Zustand
const useMenuStore = create((set) => ({
  categories: [],  // This should be in React Query!
  setCategories: (cats) => set({ categories: cats }),
}));

// ✅ GOOD - Server state in React Query, client state in Zustand
const { data: categories } = useQuery({
  queryKey: menuKeys.categories(storeId),
  queryFn: () => getCategories(storeId),
});

// Zustand only for UI state
const useUIStore = create((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}));
```

## 14. Hardcoded Strings

```typescript
// ❌ BAD - Hardcoded display text
<h1>Menu Management</h1>
<Button>Save Changes</Button>
<p>No items found</p>

// ✅ GOOD - Use translations
const t = useTranslations('menu');
<h1>{t('title')}</h1>
<Button>{t('save')}</Button>
<p>{t('noItemsFound')}</p>
```

## 15. Vague Error Messages

```typescript
// ❌ BAD - Generic error
try {
  await createMenuItem(data);
} catch (error) {
  toast.error('Error');
}

// ✅ GOOD - Descriptive error
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
```
