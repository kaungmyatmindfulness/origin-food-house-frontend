# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Origin Food House is an enterprise-grade restaurant management system built as a **Turborepo monorepo** with Next.js 15, React 19, and TypeScript. The system supports multi-language capabilities (English, Chinese, Myanmar, Thai) and follows clean architecture patterns.

**Monorepo Structure:**

- `apps/restaurant-management-system` - POS system for restaurant staff (Port 3002)
- `apps/self-ordering-system` - Customer-facing self-ordering app (Port 3001)
- `apps/admin-platform` - Admin platform (in development)
- `packages/api` - Shared API utilities with auto-generated types from OpenAPI
- `packages/ui` - Shared shadcn/ui component library (52+ components)
- `packages/eslint-config` & `packages/typescript-config` - Shared tooling

---

## Essential Commands

### Development

```bash
# Install dependencies
npm install

# Run all apps (POS on :3002, SOS on :3001)
npm run dev

# Run specific app
npm run dev --filter=@app/restaurant-management-system
npm run dev --filter=@app/self-ordering-system

# Build all apps
npm run build

# Build specific app
turbo run build --filter=@app/restaurant-management-system
```

### Quality Gates (MUST PASS before completion)

**Always run these before marking tasks complete:**

```bash
npm run format       # Format code with Prettier
npm run lint         # ESLint (max 0 warnings)
npm run check-types  # TypeScript type checking (0 errors)
npm run build        # Ensure all apps build successfully
```

**Testing (RMS only):**

```bash
npm test --workspace=@app/restaurant-management-system              # Run all tests
npm run test:watch --workspace=@app/restaurant-management-system    # Watch mode
npm run test:coverage --workspace=@app/restaurant-management-system # Coverage report
```

### OpenAPI Type Generation

**CRITICAL**: When backend API changes, regenerate types:

```bash
npm run generate:api
```

This fetches the latest OpenAPI spec from the backend and auto-generates TypeScript types in `packages/api/src/generated/`.

---

## Architecture & Code Organization

### Feature-Sliced Design

Both apps follow a strict feature-based structure:

```
src/
├── app/                    # Next.js App Router (routes)
├── features/               # Domain-driven feature modules
│   ├── auth/
│   │   ├── components/     # Feature-specific UI components
│   │   ├── services/       # API service functions (*.service.ts)
│   │   ├── store/          # Zustand state management (*.store.ts)
│   │   ├── types/          # Feature-specific types (*.types.ts)
│   │   ├── hooks/          # Custom React hooks (use*.ts)
│   │   └── queries/        # React Query key factories (*.keys.ts)
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

### File Naming Conventions

| Type       | Convention     | Example               |
| ---------- | -------------- | --------------------- |
| Components | PascalCase.tsx | `CategoryCard.tsx`    |
| Services   | `*.service.ts` | `category.service.ts` |
| Stores     | `*.store.ts`   | `auth.store.ts`       |
| Types      | `*.types.ts`   | `menu-item.types.ts`  |
| Query Keys | `*.keys.ts`    | `menu.keys.ts`        |
| Hooks      | `use*.ts`      | `useProtected.ts`     |
| Utils      | kebab-case.ts  | `format-currency.ts`  |

### Import Organization

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

---

## Code Quality & Clean Code Principles

### Core Principles

1. **Self-Documenting Code** - Use descriptive names and clear structure over comments
2. **Single Responsibility** - Each function/component has one clear purpose
3. **DRY (Don't Repeat Yourself)** - Extract reusable logic into hooks, services, or utils
4. **Small, Focused Files** - Keep files under 300 lines; split if larger
5. **Type Safety First** - Explicit types, no `any`, use auto-generated types

### Type Safety Rules

**Explicit Types Over Inference:**

```typescript
// ❌ BAD - Implicit types
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ✅ GOOD - Explicit types with auto-generated DTOs
import type { CartItemResponseDto } from '@repo/api/generated/types';

function calculateTotal(items: CartItemResponseDto[]): number {
  return items.reduce(
    (sum, item) => sum + Number(item.finalPrice) * item.quantity,
    0
  );
}
```

**Use Auto-Generated Types:**

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

**Avoid `any`, Use `unknown`:**

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

**Type Imports:**

```typescript
// ✅ GOOD - Use `import type` for type-only imports
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';
```

### Naming Conventions

**Variables:**

```typescript
// ✅ GOOD - Descriptive names
const selectedStoreId = useAuthStore((state) => state.selectedStoreId);
const isMenuItemOutOfStock = item.isOutOfStock;
const formattedPrice = formatCurrency(item.price);

// ❌ BAD - Abbreviations and unclear names
const sid = useAuthStore((state) => state.storeId);
const oos = item.oos;
const fp = fmt(item.price);
```

**Booleans:**

Use `is`, `has`, `should`, `can` prefixes:

```typescript
// ✅ GOOD
const isLoading = true;
const hasPermission = checkPermission(user);
const shouldShowDialog = !isLoading && hasData;
const canEdit = userRole === 'ADMIN';
```

**Functions:**

Use verb prefixes to indicate actions:

```typescript
// ✅ GOOD
function getCategories(storeId: string) {}
function createMenuItem(data: CreateMenuItemDto) {}
function updateOrderStatus(orderId: string, status: OrderStatus) {}
function deleteCategory(categoryId: string) {}
function handleSubmit() {}
```

### Component Composition

Break down complex components into smaller, composable pieces:

```typescript
// ❌ BAD - Monolithic component
function MenuPage() {
  return <div>{/* 500 lines of JSX */}</div>;
}

// ✅ GOOD - Composed components
function MenuPage() {
  return (
    <div>
      <MenuHeader />
      <MenuFilters />
      <MenuGrid />
      <MenuFooter />
    </div>
  );
}
```

### React Props Interface Conventions

**ALWAYS define props interfaces explicitly. NEVER use inline type annotations.**

#### Component Props Pattern

```typescript
// ✅ CORRECT - Named interface with Props suffix
interface CategoryCardProps {
  category: CategoryResponseDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  isLoading = false,
}: CategoryCardProps) {
  // ...
}

// ❌ WRONG - Inline type annotation
export function CategoryCard({
  category,
  onEdit,
}: {
  category: CategoryResponseDto;
  onEdit: (id: string) => void;
}) {
  // ...
}
```

#### Next.js Page Props Pattern

**Next.js 15+ App Router pages receive `params` and `searchParams` as Promises:**

```typescript
// ✅ CORRECT - Next.js 15 page props
interface MenuPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function MenuPage({ params, searchParams }: MenuPageProps) {
  // For client components, unwrap with use() hook
  const { locale, slug } = use(params);
  const query = use(searchParams);

  // ...
}

// ✅ CORRECT - Server component can await directly
export default async function MenuPage({ params }: MenuPageProps) {
  const { locale } = await params;
  // ...
}

// ❌ WRONG - Old Next.js 14 pattern (synchronous params)
interface MenuPageProps {
  params: { locale: string }; // Missing Promise wrapper
}
```

#### Props Naming Conventions

**Interface Name**: `{ComponentName}Props`

```typescript
// ✅ CORRECT
interface CategoryCardProps {}
interface MenuItemFormDialogProps {}
interface StoreListProps {}
interface ChooseStorePageProps {}

// ❌ WRONG - Inconsistent naming
interface ICategoryCard {} // Don't use I prefix
interface CategoryCardProperties {} // Don't use full word
interface Props {} // Too generic
```

#### Optional vs. Required Props

```typescript
interface ButtonProps {
  // Required props (no ?)
  children: React.ReactNode;
  onClick: () => void;

  // Optional props (with ?)
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'default', // ✅ Provide defaults for optional props
  size = 'md',
  disabled = false,
  className,
}: ButtonProps) {
  // ...
}
```

#### Callback Props Pattern

**Prefix event handlers with `on`, use descriptive names:**

```typescript
interface FormProps {
  // ✅ CORRECT - Descriptive callback names
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  onValidationError: (errors: ValidationError[]) => void;

  // ❌ WRONG - Vague names
  onClick: () => void; // What gets clicked?
  callback: () => void; // What does it do?
  handler: () => void; // Too generic
}
```

#### Children Props

```typescript
// ✅ CORRECT - Use React.ReactNode for children
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

// ✅ CORRECT - Optional children
interface DialogProps {
  children?: React.ReactNode;
  title: string;
}

// ❌ WRONG - Don't use JSX.Element (too restrictive)
interface ContainerProps {
  children: JSX.Element; // Only allows single element
}
```

#### Props with Generic Types

```typescript
// ✅ CORRECT - Generic props interface
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick: (row: T) => void;
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // ...
}
```

#### Extending Base Props

```typescript
// ✅ CORRECT - Extend HTML element props
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function CustomButton({
  variant = 'primary',
  isLoading,
  children,
  className,
  ...rest  // Spreads all native button props
}: CustomButtonProps) {
  return (
    <button className={className} {...rest}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

#### Unused Parameters Convention

**Prefix unused parameters with underscore `_`:**

```typescript
// ✅ CORRECT - Prefix unused params with _
const mutation = useMutation({
  mutationFn: (data: FormData) => createItem(data),
  onSuccess: (_data, variables) => {
    // We don't use _data but need variables
    console.log('Created item with id:', variables.id);
  },
  onError: (_error, _variables, context) => {
    // Only context is used
    rollback(context);
  },
});

// ❌ WRONG - ESLint will warn about unused parameters
const mutation = useMutation({
  mutationFn: (data: FormData) => createItem(data),
  onSuccess: (data, variables) => {
    // 'data' declared but never read
    console.log('Created item');
  },
});
```

#### Props Documentation

**Use JSDoc for complex props:**

```typescript
interface PaymentDialogProps {
  /** The order ID to process payment for */
  orderId: string;

  /** Total amount to be paid (in cents) */
  amount: number;

  /**
   * Callback fired when payment is successfully processed
   * @param transactionId - The unique transaction identifier
   */
  onSuccess: (transactionId: string) => void;

  /**
   * Whether to allow split payments
   * @default false
   */
  allowSplit?: boolean;
}
```

#### Common Props Patterns

```typescript
// ✅ Dialog/Modal components
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

// ✅ Form components
interface FormProps {
  initialValues?: FormData;
  onSubmit: (data: FormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  validationSchema?: ZodSchema;
}

// ✅ List/Grid components
interface ListProps<T> {
  items: T[];
  onItemClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  renderItem?: (item: T) => React.ReactNode;
}
```

#### Props Anti-Patterns to Avoid

```typescript
// ❌ BAD - Too many optional props (prop drilling)
interface ComponentProps {
  prop1?: string;
  prop2?: number;
  prop3?: boolean;
  // ... 20 more optional props
}

// ✅ GOOD - Group related props into objects
interface ComponentProps {
  config: {
    theme: string;
    layout: string;
    spacing: number;
  };
  handlers: {
    onSave: () => void;
    onCancel: () => void;
  };
}

// ❌ BAD - Boolean trap (unclear what true/false means)
interface ButtonProps {
  primary: boolean;
}

// ✅ GOOD - Use enums or union types
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
}
```

#### Summary Checklist

- [ ] Props interface named `{ComponentName}Props`
- [ ] Interface defined **before** component function
- [ ] Required props listed first, optional props with `?` after
- [ ] Callbacks prefixed with `on` (e.g., `onSubmit`, `onCancel`)
- [ ] Children typed as `React.ReactNode`
- [ ] Next.js 15 params wrapped in `Promise<>`
- [ ] Unused parameters prefixed with `_`
- [ ] Default values provided in destructuring
- [ ] Complex props documented with JSDoc
- [ ] No inline type annotations

### Code Comments Philosophy

**Code should be self-documenting. Comments explain WHY, not WHAT.**

```typescript
// ❌ BAD - Obvious comments
// Get categories
const categories = await getCategories(storeId);

// ✅ GOOD - Explain WHY when necessary
/**
 * HubSpot Forms API requires a specific delay between submissions
 * to prevent rate limiting (500ms minimum based on their docs)
 * @see https://developers.hubspot.com/docs/api/marketing/forms
 */
await delay(500);
```

**Use JSDoc for:**

- External API integrations
- Complex algorithms
- Non-obvious business logic
- Public library functions

---

## Design System Guidelines

### Core Design Principles

1. **Use Component Props Over Custom Classes** - Prefer `variant` and `size` props
2. **Semantic Colors Only** - Use design system tokens, never raw Tailwind colors
3. **No Arbitrary Values** - Avoid `w-[234px]` or `text-[13px]`
4. **Consistent Spacing** - Follow spacing scale (4, 6, 8, 12, 16, 24)
5. **Check `@repo/ui` First** - We have 52+ pre-built components

### Color System

**ALWAYS use semantic tokens from `globals.css`:**

| Token              | Usage                                   |
| ------------------ | --------------------------------------- |
| `background`       | Page backgrounds                        |
| `foreground`       | Primary text                            |
| `muted`            | Muted backgrounds (secondary UI)        |
| `muted-foreground` | Muted text (descriptions, placeholders) |
| `primary`          | Brand color (CTA buttons, links)        |
| `destructive`      | Destructive actions (delete, cancel)    |
| `border`           | Borders                                 |
| `input`            | Input borders                           |
| `ring`             | Focus rings                             |

```typescript
// ✅ CORRECT - Semantic tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">
<Card className="border-border">

// ❌ WRONG - Raw colors
<div className="bg-white text-gray-900">
<p className="text-gray-500">
<Card className="border-gray-200">
```

### Component Usage Patterns

**Buttons:**

```typescript
// ✅ CORRECT - Use variant props
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// ❌ WRONG - Don't override with custom classes
<Button className="bg-red-600 hover:bg-red-700 h-12 px-6">Delete</Button>
```

**Badges:**

```typescript
// ✅ CORRECT
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Suspended</Badge>
<Badge variant="outline">Draft</Badge>

// ❌ WRONG
<Badge className="bg-green-500 text-white">Active</Badge>
```

**Cards:**

```typescript
// ✅ CORRECT - Use Card components with semantic structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ WRONG - Don't use arbitrary padding
<Card>
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Title</h2>
  </div>
</Card>
```

**Inputs:**

```typescript
// ✅ CORRECT - Basic input
<Input
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// ✅ CORRECT - With icon
<div className="relative">
  <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
  <Input placeholder="Search..." className="pl-9" />
</div>

// ❌ WRONG - Don't add arbitrary borders or colors
<Input className="border-blue-500 bg-gray-50" />
```

### Spacing & Layout

**Container Patterns:**

```typescript
// ✅ CORRECT - Page container
<div className="container mx-auto py-8">
  <div className="space-y-6">
    {/* Page sections with consistent vertical spacing */}
  </div>
</div>

// ✅ CORRECT - Content padding
<div className="p-8">  {/* Large padding for major sections */}
<div className="p-6">  {/* Medium padding for cards */}
<div className="p-4">  {/* Small padding for compact areas */}

// ❌ WRONG - Arbitrary padding values
<div className="pt-[23px] pb-[17px] pl-[31px]">
```

**Vertical Spacing:**

```typescript
// ✅ CORRECT - Consistent spacing
<div className="space-y-6">  {/* Between major sections */}
<div className="space-y-4">  {/* Between related elements */}
<div className="space-y-2">  {/* Between tightly grouped items */}

// ❌ WRONG - Inconsistent spacing
<div className="mb-3">
<div className="mt-5">
<div className="mb-7">
```

**Grid Layouts:**

```typescript
// ✅ CORRECT - Standard grid patterns
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="grid gap-6 md:grid-cols-3">

// ❌ WRONG - Arbitrary grid values
<div className="grid grid-cols-[200px,1fr,300px] gap-[17px]">
```

### Typography

**Heading Hierarchy:**

```typescript
// ✅ CORRECT - Semantic heading sizes
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection Title</h3>
<h4 className="text-lg font-medium">Card Title</h4>

// ❌ WRONG - Arbitrary font sizes
<h1 className="text-[32px] font-black leading-[1.2]">
```

**Text Styles:**

```typescript
// ✅ CORRECT - Semantic text styles
<p className="text-sm text-muted-foreground">Description text</p>
<span className="text-xs text-muted-foreground">Helper text</span>
<p className="font-medium">Emphasized text</p>

// ❌ WRONG - Raw color classes
<p className="text-gray-500 text-[13px]">
```

### When Custom Classes ARE Acceptable

**Layout & Positioning:**

```typescript
// ✅ CORRECT - Layout utilities
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">
<div className="absolute top-0 right-0">
<div className="sticky top-0">
```

**Responsive Design:**

```typescript
// ✅ CORRECT - Responsive utilities
<div className="hidden md:block">
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

**State Variations:**

```typescript
// ✅ CORRECT - State-based styling
<div className="hover:bg-accent">
<Input className="focus:ring-2" />
<Button className="disabled:opacity-50">
```

---

## Critical Patterns

### 1. API Services with Auto-Generated Types

**ALWAYS use auto-generated types from `@repo/api/generated/types`:**

```typescript
import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';

/**
 * Fetches all categories for a store
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
 * Creates a new category
 */
export async function createCategory(
  storeId: string,
  data: CreateCategoryDto
): Promise<CategoryResponseDto> {
  const res = await apiFetch<CategoryResponseDto>({
    path: '/categories',
    method: 'POST',
    query: { storeId },
    body: JSON.stringify(data),
  });

  return unwrapData(res, 'Failed to create category');
}
```

**Key Points:**

- Use `apiFetch()` from `@/utils/apiFetch` (configured with auth headers)
- Always use `unwrapData()` for consistent error handling
- Import types from `@repo/api/generated/types` (NEVER manually define API types)
- Add JSDoc comments for service functions
- Return explicit types, never rely on inference

### 2. React Query Key Factories

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

### 3. Zustand State Management

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

### 4. Error Handling Pattern

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

### 5. Optimistic Updates

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

### 6. Internationalization (i18n)

All user-facing strings MUST be translated in all 4 languages: `en`, `zh`, `my`, `th`.

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <Button>{t('save')}</Button>
    </div>
  );
}
```

**Translation files:** `messages/[locale]/*.json`

When adding new features, add translation keys to all language files. Check existing patterns in `messages/en/` first.

### 7. Performance Optimization

**Memoization:**

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

**Query Stale Time:**

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

**Debounce User Input:**

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

### 8. Security Best Practices

**Sanitize User Input:**

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

**Prevent XSS:**

```typescript
// ❌ BAD
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ GOOD - Avoid dangerouslySetInnerHTML entirely
<div>{userInput}</div>
```

**Environment Variables:**

```typescript
// ❌ BAD - Secret exposed to client
const API_SECRET = 'secret-key-123';

// ✅ GOOD - Only NEXT_PUBLIC_* vars are exposed to client
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ GOOD - Server-side only (no NEXT_PUBLIC prefix)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
```

---

## Common Anti-Patterns to Avoid

### 1. Prop Drilling

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

### 2. Magic Numbers

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

### 3. Deeply Nested Conditionals

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

### 4. Large Catch Blocks

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

---

## Common Workflows

### Adding a New Feature

1. Create feature directory in `src/features/[feature-name]/`
2. Structure: `components/`, `services/`, `store/`, `queries/`, `types/`, `hooks/`
3. Write API service functions using auto-generated types
4. Create query key factory for React Query
5. Create Zustand store if global state needed (export selectors)
6. Build UI with `@repo/ui` components (check existing components first)
7. Add translations to all 4 language files
8. Run quality gates: `format`, `lint`, `check-types`, `build`

### Updating API Integration

1. Backend team updates OpenAPI spec
2. Run `npm run generate:api` to regenerate types
3. TypeScript compiler will show errors if contracts changed
4. Update affected service functions and components
5. Run tests and quality gates

### Adding UI Components

1. **Check `packages/ui/src/components/` first** - Component might already exist
2. If component exists, use it with variant props
3. If new component needed:
   - Add to `@repo/ui` if reusable across apps
   - Add to `features/[feature]/components/` if feature-specific
4. Follow design system guidelines (semantic colors, component composition)
5. Add to component index if in `@repo/ui`

### Testing Workflow (RMS only)

**Test Business Logic, Not Implementation:**

```typescript
// ✅ GOOD - Tests behavior
it('should display error message when email is invalid', async () => {
  render(<LoginForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.click(submitButton);

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});

// ❌ BAD - Tests implementation
it('should call validateEmail function', () => {
  const validateEmail = jest.fn();
  render(<LoginForm validateEmail={validateEmail} />);
});
```

**Use Testing Library Best Practices:**

```typescript
// ✅ GOOD - Query by accessibility
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ BAD - Test IDs
screen.getByTestId('submit-button');
```

**Mock External Dependencies:**

```typescript
// ✅ GOOD
jest.mock('@/features/menu/services/category.service', () => ({
  getCategories: jest.fn().mockResolvedValue([
    { id: '1', name: 'Appetizers', storeId: 'store-1' },
  ]),
}));

it('should display categories', async () => {
  render(<CategoryList />);

  await waitFor(() => {
    expect(screen.getByText('Appetizers')).toBeInTheDocument();
  });
});
```

---

## Environment Setup

Create `.env` files in each app directory:

**RMS:** `apps/restaurant-management-system/.env`
**SOS:** `apps/self-ordering-system/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

---

## Tech Stack Details

### Core Framework

- **Next.js 15** (App Router with Turbopack)
- **React 19**
- **TypeScript 5.8+**

### State Management

- **Zustand** (with immer, persist, devtools) - Global client state only
- **React Query** (@tanstack/react-query) - Server state & caching

### Styling

- **Tailwind CSS v4** (@tailwindcss/postcss)
- **Motion** (Framer Motion alternative)
- **shadcn/ui** via `@repo/ui`

### API & Data

- `apiFetch` utility with auto error handling
- **Auto-generated types** from OpenAPI (@hey-api/openapi-ts)
- **Socket.IO Client** (real-time features in both apps)

### Forms & Validation

- **react-hook-form**
- **Zod** validation

### POS-Specific Dependencies

- **@dnd-kit** - Drag-and-drop menu reordering
- **qrcode.react** - Table QR code generation
- **react-to-print** - Receipt printing
- **recharts** - Reports and analytics

### SOS-Specific Dependencies

- **socket.io-client** - Real-time cart synchronization
- **react-scroll** - Smooth menu category navigation
- **decimal.js** - Precise currency calculations

---

## Important Files & Locations

- **API client config:** `apps/*/src/utils/apiFetch.ts`
- **Auto-generated types:** `packages/api/src/generated/types.gen.ts`
- **Shared components:** `packages/ui/src/components/`
- **Translation files:** `messages/[locale]/*.json`
- **Global styles:** `packages/ui/src/styles/globals.css`
- **Semantic color tokens:** `packages/ui/src/styles/globals.css`
- **i18n config:** `apps/*/src/i18n/`
- **Socket providers:** `apps/*/src/utils/socket-provider.tsx`

---

## Socket.IO Implementation

Both apps use Socket.IO for real-time features:

**POS:** Kitchen order updates, order status changes
**SOS:** Real-time cart synchronization across devices

Socket providers are configured in:

- `apps/restaurant-management-system/src/utils/socket-provider.tsx`
- `apps/self-ordering-system/src/utils/socket-provider.tsx`

Sockets are initialized with namespace patterns and use modular event handlers.

---

## Pre-Completion Checklist

Before marking any task as complete, verify:

### Quality Gates

- [ ] Code formatted (`npm run format`)
- [ ] No lint warnings (`npm run lint`)
- [ ] No type errors (`npm run check-types`)
- [ ] All apps build successfully (`npm run build`)
- [ ] Tests pass (RMS: `npm test --workspace=@app/restaurant-management-system`)

### Code Quality

- [ ] Used `@repo/ui` components (checked first)
- [ ] Auto-generated API types used (not manual types)
- [ ] Query key factories created/updated
- [ ] Zustand selectors exported
- [ ] Self-documenting code (minimal comments)
- [ ] No `any` types
- [ ] Explicit return types on all service functions
- [ ] `import type` used for type-only imports

### Design System

- [ ] Semantic colors only (no raw Tailwind colors)
- [ ] Component variant props used (not custom classes)
- [ ] No arbitrary values (`w-[234px]`, `text-[13px]`)
- [ ] Consistent spacing scale (4, 6, 8, 12, 16, 24)

### Features

- [ ] Translations added (all 4 languages: en, zh, my, th)
- [ ] No hardcoded strings
- [ ] Error handling consistent (`unwrapData()`)
- [ ] User-friendly error messages

---

## Workspace-Specific Commands

```bash
# Run command in specific workspace
npm run dev --workspace=@app/restaurant-management-system
npm run build --workspace=@repo/api
npm test --workspace=@app/restaurant-management-system

# Or use Turbo filters
turbo run dev --filter=@app/self-ordering-system
turbo run check-types --filter=@repo/ui
```

---

## Key Architectural Decisions

### Why Turborepo?

Fast builds with intelligent caching, shared packages eliminate code duplication, monorepo keeps related code together.

### Why Auto-Generated Types?

Single source of truth (backend API spec), compile-time safety, eliminates manual type maintenance, catches API mismatches early.

### Why Zustand over Redux?

Minimal boilerplate, better TypeScript support, simpler API, works seamlessly with React Query for server state.

### Why Feature-Sliced Design?

Better code organization, easier to navigate, enforces separation of concerns, scales with team size.

### Why next-intl?

Native Next.js 15 App Router support, type-safe translations, clean URLs without locale prefixes, cookie-based persistence.

---

## Additional Documentation

- **`README.md`** - Project overview and architecture details
- **`packages/api/README.md`** - API package usage and OpenAPI integration
- **`I18N_GUIDE.md`** - Internationalization usage guide

---

**Remember:** Quality over speed. Always run all quality gates before completion. Code should be maintainable, type-safe, and follow established patterns.
