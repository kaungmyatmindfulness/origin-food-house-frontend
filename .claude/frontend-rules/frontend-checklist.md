# Frontend Quality Checklist & Anti-Patterns

This guide covers quality gates, common anti-patterns, testing, and workflows.

---

## Quality Gates (MUST PASS)

```bash
npm run format       # Format code
npm run lint         # Lint (0 warnings)
npm run check-types  # Type check (0 errors)
npm run build        # Build succeeds
```

RMS-specific:
```bash
npm test --workspace=@app/restaurant-management-system
```

---

## Pre-Completion Checklist

### Code Quality

- [ ] Used `@repo/ui` components
- [ ] API types imported directly from `@repo/api/generated/types`
- [ ] No type re-export files
- [ ] No type casting (`as Type[]`) for API responses
- [ ] No `any` types
- [ ] `import type` for type-only imports

### Design System

- [ ] Semantic colors only (no `bg-white`, `text-gray-500`)
- [ ] Component variant props (not custom classes)
- [ ] No arbitrary values (`w-[234px]`)

### i18n

- [ ] Translations in all 4 languages (en, zh, my, th)
- [ ] No hardcoded display strings

---

## Anti-Patterns to Avoid

### 1. Prop Drilling

```typescript
// ❌ BAD
<Parent user={user}><Child user={user}><GrandChild user={user} /></Child></Parent>

// ✅ GOOD - Zustand
const user = useAuthStore((state) => state.user);
```

### 2. Magic Numbers

```typescript
// ❌ BAD
if (items.length > 50) { toast.warning('Too many'); }

// ✅ GOOD
const MAX_ITEMS_PER_ORDER = 50;
if (items.length > MAX_ITEMS_PER_ORDER) { toast.warning(`Max ${MAX_ITEMS_PER_ORDER}`); }
```

### 3. Deeply Nested Conditionals

```typescript
// ❌ BAD
if (user) { if (user.isAuthenticated) { if (user.role === 'ADMIN') { return <Button />; } } }

// ✅ GOOD - Early returns
if (!user?.isAuthenticated) return null;
if (user.role !== 'ADMIN') return null;
return <Button />;
```

### 4. Using `any` Type

```typescript
// ❌ BAD
function handleError(error: any) { console.error(error.message); }

// ✅ GOOD
function handleError(error: unknown) {
  if (error instanceof Error) { console.error(error.message); }
}
```

### 5. Manual Type Definitions for API Data

```typescript
// ❌ BAD
interface Category { id: string; name: string; }

// ✅ GOOD - Direct import
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

### 6. Type Re-export Files

```typescript
// ❌ BAD - features/menu/types/category.types.ts
export type { CategoryResponseDto } from '@repo/api/generated/types';

// ✅ GOOD - Import directly where needed
import type { CategoryResponseDto } from '@repo/api/generated/types';
```

### 7. Type Casting API Responses

```typescript
// ❌ BAD
const categories = (response?.data ?? []) as CategoryResponseDto[];

// ✅ GOOD
const categories = response?.data ?? [];
```

### 8. Raw Tailwind Colors

```typescript
// ❌ BAD
<div className="bg-white text-gray-500">

// ✅ GOOD
<div className="bg-background text-muted-foreground">
```

### 9. Arbitrary CSS Values

```typescript
// ❌ BAD
<div className="pt-[23px] w-[234px] text-[13px]">

// ✅ GOOD
<div className="pt-6 w-60 text-sm">
```

### 10. Button for Navigation

```typescript
// ❌ BAD
<Button onClick={() => router.push('/store/create')}>Create</Button>

// ✅ GOOD
<Button asChild><Link href="/store/create">Create</Link></Button>
```

### 11. Locale in URL Routes (RMS)

```typescript
// ❌ BAD
<Link href={`/${locale}/hub/menu`}>Menu</Link>

// ✅ GOOD
<Link href="/hub/menu">Menu</Link>
```

### 12. Inline Type Annotations for Props

```typescript
// ❌ BAD
export function Card({ data }: { data: CardData }) {}

// ✅ GOOD
interface CardProps { data: CardData; }
export function Card({ data }: CardProps) {}
```

### 13. Overriding Component Styling

```typescript
// ❌ BAD
<Button className="bg-red-600 h-12 px-6">Delete</Button>

// ✅ GOOD
<Button variant="destructive" size="lg">Delete</Button>
```

### 14. Mixing Server and Client State

```typescript
// ❌ BAD - Server data in Zustand
const useMenuStore = create((set) => ({
  categories: [],
  setCategories: (cats) => set({ categories: cats }),
}));

// ✅ GOOD - Server state in React Query
const { data: response } = $api.useQuery('get', '/stores/{storeId}/categories', ...);
const categories = response?.data ?? [];

// Zustand only for UI state
const useUIStore = create((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
}));
```

### 15. Using Service Functions (Deprecated)

```typescript
// ❌ BAD
import { getCategories } from '@/features/menu/services/category.service';
const { data } = useQuery({ queryFn: () => getCategories(storeId) });

// ✅ GOOD
const { data } = $api.useQuery('get', '/stores/{storeId}/categories', ...);
```

### 16. Hardcoded Strings

```typescript
// ❌ BAD
<h1>Menu Management</h1>
<Button>Save Changes</Button>

// ✅ GOOD
const t = useTranslations('menu');
<h1>{t('title')}</h1>
<Button>{t('save')}</Button>
```

### 17. Vague Error Messages

```typescript
// ❌ BAD
catch (error) { toast.error('Error'); }

// ✅ GOOD
catch (error) {
  toast.error('Failed to create menu item', {
    description: error instanceof Error ? error.message : 'Please try again',
  });
}
```

---

## Testing (RMS Only)

### Test Business Logic, Not Implementation

```typescript
// ✅ GOOD - Tests behavior
it('should display error message when email is invalid', async () => {
  render(<LoginForm />);
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

### Query by Accessibility

```typescript
// ✅ GOOD
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// ❌ BAD
screen.getByTestId('submit-button');
```

### Mock $api Hooks

```typescript
jest.mock('@/utils/apiFetch', () => ({
  $api: {
    useQuery: jest.fn().mockReturnValue({
      data: { data: [{ id: '1', name: 'Appetizers' }] },
      isLoading: false,
    }),
    useMutation: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    }),
  },
}));
```

---

## Workflows

### Adding a New Feature

1. Create feature directory: `src/features/[feature-name]/`
2. Structure: `components/`, `hooks/`, `store/`, `queries/`, `schemas/`
3. Use `$api` hooks for API calls
4. Create query key factory if needed
5. Create Zustand store if global state needed (export selectors)
6. Build UI with `@repo/ui` components
7. Add translations to all 4 language files
8. Run quality gates

### Updating API Integration

1. Backend updates OpenAPI spec
2. Run `npm run generate:api` to regenerate types
3. TypeScript compiler shows errors if contracts changed
4. Update affected components
5. Run quality gates

### Adding UI Components

1. Check `packages/ui/src/components/` first
2. Use existing component with variant props
3. If new component needed:
   - Add to `@repo/ui` if reusable across apps
   - Add to `features/[feature]/components/` if feature-specific

---

## Environment Setup

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

---

## Workspace Commands

```bash
# Run specific workspace
npm run dev --filter=@app/restaurant-management-system
npm run build --filter=@repo/api
npm test --filter=@app/restaurant-management-system

# Or Turbo filters
turbo run dev --filter=@app/self-ordering-system
```
