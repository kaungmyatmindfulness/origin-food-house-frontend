# React Props Interface Conventions

**ALWAYS define props interfaces explicitly. NEVER use inline type annotations.**

## Component Props Pattern

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

## Next.js Page Props Pattern

**Next.js 15+ App Router pages receive `params` and `searchParams` as Promises:**

```typescript
// ✅ CORRECT - Page with dynamic params (e.g., [slug])
interface MenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function MenuPage({ params, searchParams }: MenuPageProps) {
  // For client components, unwrap with use() hook
  const { slug } = use(params);
  const query = use(searchParams);

  // ...
}

// ✅ CORRECT - Server component can await directly
export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;
  // ...
}

// ✅ CORRECT - RMS pages usually don't need params
// (locale is in file structure but handled by middleware)
export default function ChooseStorePage() {
  const t = useTranslations('store.choose');
  const router = useRouter();

  // No params needed - middleware handles locale routing
  // Navigate without locale prefix
  router.replace('/store/create');  // ✅ Correct

  return <div>{t('title')}</div>;
}

// ❌ WRONG - Old Next.js 14 pattern (synchronous params)
interface MenuPageProps {
  params: { slug: string };  // Missing Promise wrapper
}
```

**RMS-Specific Note:**

- Locale is in file structure (`app/[locale]/`) but NOT in URLs
- Most pages don't need `params.locale` - use `useLocale()` hook instead
- Middleware handles locale routing via cookie
- Only extract params if you have other dynamic segments (e.g., `[id]`, `[slug]`)

## Props Naming Conventions

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

## Optional vs. Required Props

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

## Callback Props Pattern

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

## Children Props

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

## Props with Generic Types

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

## Extending Base Props

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

## Unused Parameters Convention

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

## Props Documentation

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

## Common Props Patterns

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

## Props Anti-Patterns to Avoid

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

## Summary Checklist

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
