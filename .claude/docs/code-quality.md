# Code Quality & Clean Code Principles

## Core Principles

1. **Self-Documenting Code** - Use descriptive names and clear structure over comments
2. **Single Responsibility** - Each function/component has one clear purpose
3. **DRY (Don't Repeat Yourself)** - Extract reusable logic into hooks, services, or utils
4. **Small, Focused Files** - Keep files under 300 lines; split if larger
5. **Type Safety First** - Explicit types, no `any`, use auto-generated types

## Type Safety Rules

### Explicit Types Over Inference

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

### Use Auto-Generated Types

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

### Avoid `any`, Use `unknown`

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

### Type Imports

```typescript
// ✅ GOOD - Use `import type` for type-only imports
import type {
  CategoryResponseDto,
  CreateCategoryDto,
} from '@repo/api/generated/types';
```

## Naming Conventions

### Variables

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

### Booleans

Use `is`, `has`, `should`, `can` prefixes:

```typescript
// ✅ GOOD
const isLoading = true;
const hasPermission = checkPermission(user);
const shouldShowDialog = !isLoading && hasData;
const canEdit = userRole === 'ADMIN';
```

### Functions

Use verb prefixes to indicate actions:

```typescript
// ✅ GOOD
function getCategories(storeId: string) {}
function createMenuItem(data: CreateMenuItemDto) {}
function updateOrderStatus(orderId: string, status: OrderStatus) {}
function deleteCategory(categoryId: string) {}
function handleSubmit() {}
```

## Component Composition

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

## Code Comments Philosophy

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
