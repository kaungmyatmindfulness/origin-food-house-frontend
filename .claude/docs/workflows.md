# Common Workflows

## Adding a New Feature

1. Create feature directory in `src/features/[feature-name]/`
2. Structure: `components/`, `services/`, `store/`, `queries/`, `types/`, `hooks/`
3. Write API service functions using auto-generated types
4. Create query key factory for React Query
5. Create Zustand store if global state needed (export selectors)
6. Build UI with `@repo/ui` components (check existing components first)
7. Add translations to all 4 language files
8. Run quality gates: `format`, `lint`, `check-types`, `build`

## Updating API Integration

1. Backend team updates OpenAPI spec
2. Run `npm run generate:api` to regenerate types
3. TypeScript compiler will show errors if contracts changed
4. Update affected service functions and components
5. Run tests and quality gates

## Adding UI Components

1. **Check `packages/ui/src/components/` first** - Component might already exist
2. If component exists, use it with variant props
3. If new component needed:
   - Add to `@repo/ui` if reusable across apps
   - Add to `features/[feature]/components/` if feature-specific
4. Follow design system guidelines (semantic colors, component composition)
5. Add to component index if in `@repo/ui`

## Testing Workflow (RMS only)

### Test Business Logic, Not Implementation

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

### Use Testing Library Best Practices

```typescript
// ✅ GOOD - Query by accessibility
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByText(/welcome/i);

// ❌ BAD - Test IDs
screen.getByTestId('submit-button');
```

### Mock External Dependencies

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

## Environment Setup

Create `.env` files in each app directory:

**RMS:** `apps/restaurant-management-system/.env`
**SOS:** `apps/self-ordering-system/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

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
