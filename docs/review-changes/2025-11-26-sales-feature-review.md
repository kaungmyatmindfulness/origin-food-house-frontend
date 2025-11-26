# Code Review: Sales Feature Implementation

**Review Date:** 2025-11-26
**Reviewer:** Claude Code
**Scope:** Sales page redesign and new sales feature module

---

## Summary

This review covers the implementation of a new Sales feature for the Restaurant Management System (RMS). The changes include:

- Complete redesign of the sales page (`page.tsx`)
- New sales feature module with 16 components
- Zustand store for sales state management
- Custom hooks for cart operations
- Query key factories for React Query
- Translation files for all 4 locales (en, zh, my, th)
- Updates to order service for cart item updates

**Overall Assessment:** The implementation follows project conventions well and demonstrates solid architecture. There are several P1 and P2 issues that should be addressed for production readiness.

---

## 1. Code Quality & Standards

### Strengths

- **Feature-Sliced Design:** Properly organized under `features/sales/` with correct folder structure (components, hooks, store, types, queries)
- **Component composition:** Large components like `page.tsx` delegate to smaller, focused components
- **Type safety:** Consistent use of auto-generated types from `@repo/api/generated/types`
- **Props interfaces:** All components use named `{ComponentName}Props` pattern
- **Translation coverage:** Complete translations in all 4 locales with matching keys
- **Design system:** Uses `@repo/ui` components and semantic color tokens

### Areas for Improvement

1. **Unused parameter pattern:** `CartPanel.tsx:99-100` uses `void storeId;` to suppress warnings. This prop should either be used or removed from the interface.

2. **Hardcoded strings in ReceiptPanel:** The `formatPaymentMethod` function (lines 228-240) uses hardcoded English strings instead of translations:

   ```typescript
   // Current
   const methodMap: Record<string, string> = {
     CASH: 'Cash',
     CREDIT_CARD: 'Credit Card',
     ...
   };

   // Should use
   const methodMap = {
     CASH: t('payments.cash'),
     ...
   };
   ```

3. **Inline color classes:** `PaymentPanel.tsx:185-187` uses raw Tailwind color:

   ```typescript
   className={`text-2xl font-bold ${isValidTendered ? 'text-green-600' : 'text-destructive'}`}
   ```

   Should use semantic tokens or badge variants.

4. **SalesMenuItemCard.tsx:73-79** uses inline styling for Badge:
   ```typescript
   className = 'bg-yellow-500 text-yellow-900 hover:bg-yellow-500';
   ```
   Consider adding a `warning` variant to Badge component instead.

---

## 2. Correctness & Logic

### Potential Issues

1. **TablesView mock data (P0):** `TablesView.tsx:27-33` contains a mock function that returns an empty array:

   ```typescript
   async function getTablesWithStatus(
     storeId: string
   ): Promise<TableWithStatus[]> {
     console.log('getTablesWithStatus called for store:', storeId);
     // Mock data - BE should implement this
     return [];
   }
   ```

   This will cause the tables view to always show "No tables found" until backend integration.

2. **Receipt data transformation (P1):** `page.tsx:178-205` has complex type casting with TODO comments:

   ```typescript
   // TODO: menuItemName should come from BE when order includes populated items
   menuItemName: (item as { menuItemName?: string }).menuItemName || 'Item',
   ```

   This suggests the backend API may need updates or the frontend is handling incomplete data.

3. **handleTableSessionStart uses store state incorrectly (P1):** `page.tsx:140-145`

   ```typescript
   const handleTableSessionStart = (sessionId: string, tableId: string) => {
     const setSelectedTable = useSalesStore.getState().setSelectedTable;
     // ...
   };
   ```

   This accesses store state within a handler rather than using the already-defined `setSelectedTable` from the component's store subscriptions.

4. **Missing required customization validation (P2):** `QuickAddDialog.tsx` doesn't validate that required customization groups have at least one selection before allowing submission.

5. **Quick amounts filter logic (P2):** `PaymentPanel.tsx:61-63`:
   ```typescript
   const quickAmounts = [50, 100, 200, 500, 1000].filter(
     (amt) => amt >= orderTotal
   );
   ```
   This hides all quick amounts when order total exceeds 1000, which may not be intended.

---

## 3. Priority Issues

### P0 - Must Fix Before Commit

| Issue                          | Location               | Description                                                            |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------------- |
| Mock API function              | `TablesView.tsx:27-33` | `getTablesWithStatus` returns empty array - tables view non-functional |
| Console.log in production code | `TablesView.tsx:30`    | Remove `console.log` statement                                         |

### P1 - Should Fix

| Issue                            | Location                         | Description                                                |
| -------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| Hardcoded payment method strings | `ReceiptPanel.tsx:228-240`       | Move to translations for i18n support                      |
| Direct state access in handler   | `page.tsx:140-145`               | Use existing store subscription instead of `getState()`    |
| Receipt data transformation      | `page.tsx:178-205`               | Complex type casting indicates API contract mismatch       |
| Missing cart session ID check    | `checkoutMutation` in `page.tsx` | `noActiveSession` error toast but checkout still attempted |

### P2 - Nice to Fix

| Issue                   | Location                      | Description                                  |
| ----------------------- | ----------------------------- | -------------------------------------------- |
| Unused `storeId` prop   | `CartPanel.tsx:33,99-100`     | Either use the prop or remove from interface |
| Raw Tailwind colors     | `PaymentPanel.tsx:187`        | Use semantic tokens                          |
| Badge inline styling    | `SalesMenuItemCard.tsx:73-79` | Add variant to design system                 |
| Quick amounts edge case | `PaymentPanel.tsx:61-63`      | Handle orders > 1000                         |

### P3 - Optional

| Issue                       | Location                                              | Description                             |
| --------------------------- | ----------------------------------------------------- | --------------------------------------- |
| Skeleton count magic number | Multiple components                                   | Extract to constant (8 skeletons)       |
| Duplicate type definition   | `MenuPanel.tsx:24-26` & `SalesMenuItemCard.tsx:19-21` | Same `SalesMenuItem` type defined twice |

---

## 4. Architecture & Impact

### Dependencies (Good)

- Proper use of existing services: `order.service.ts`, `session.service.ts`, `payment.service.ts`, `category.service.ts`, `menu-item.service.ts`
- Reuses existing menu feature queries (`menuKeys`)
- Uses auto-generated types from `@repo/api`

### State Management (Good)

- Clean separation between client state (Zustand) and server state (React Query)
- Store persists only essential data (view, session, table selection)
- Query keys properly structured with hierarchical invalidation

### Potential Technical Debt

1. **Duplicate types:** `SalesMenuItem` defined in both `MenuPanel.tsx` and `SalesMenuItemCard.tsx`. Should be in `sales.types.ts`.

2. **Missing selectors in store:** While selectors are exported, some components access state directly:

   ```typescript
   // Uses direct access
   const activeView = useSalesStore((state) => state.activeView);

   // Could use selector
   const activeView = useSalesStore(selectActiveView);
   ```

3. **Order service growing:** `order.service.ts` now has cart, checkout, and order operations. Consider splitting into `cart.service.ts` for better separation.

### Security

- No obvious security issues
- User input through forms uses controlled components
- API calls go through `apiFetch` with proper auth handling
- No dangerouslySetInnerHTML usage

### Performance Considerations

- Uses `useMemo` for filtered items in `MenuPanel.tsx`
- Appropriate `staleTime` values on queries (30s for dynamic, 5min for static)
- Image optimization with Next.js Image component
- Scroll areas for long lists

---

## 5. Actionable Recommendations

### High Priority

1. **Integrate tables API:**

   ```typescript
   // TablesView.tsx - Replace mock with real service
   import { getTablesWithStatus } from '@/features/tables/services/table.service';
   ```

2. **Remove console.log:**

   ```typescript
   // TablesView.tsx:30 - Delete this line
   console.log('getTablesWithStatus called for store:', storeId);
   ```

3. **Fix store state access in handler:**

   ```typescript
   // page.tsx - Use existing subscription
   const handleTableSessionStart = (sessionId: string, tableId: string) => {
     setSelectedTable(tableId); // Use the already subscribed action
     setActiveSession(sessionId, 'TABLE');
   };
   ```

4. **Localize payment methods:**
   ```typescript
   // ReceiptPanel.tsx - Use translations
   function formatPaymentMethod(method: PaymentMethod, t: TFunction): string {
     return t(`sales.paymentMethods.${method.toLowerCase()}`);
   }
   ```

### Medium Priority

5. **Consolidate duplicate types:**

   ```typescript
   // sales.types.ts - Add type
   export type SalesMenuItem = MenuItemDto & {
     isOutOfStock?: boolean;
   };
   ```

6. **Remove unused prop or use it:**

   ```typescript
   // CartPanel.tsx - Either remove from interface
   interface CartPanelProps {
     sessionId: string | null;
     // storeId: string; // Remove if not needed
     onCheckout: () => void;
   }

   // Or use it for something like refetching
   ```

7. **Add validation for required customizations:**

   ```typescript
   // QuickAddDialog.tsx
   const hasRequiredSelections = item.customizationGroups?.every(group => {
     if (!group.required) return true;
     return selectedCustomizations.some(id =>
       group.customizationOptions?.some(opt => opt.id === id)
     );
   }) ?? true;

   // Disable submit if validation fails
   disabled={isLoading || !hasRequiredSelections}
   ```

### Low Priority

8. **Use semantic colors consistently:**

   ```typescript
   // PaymentPanel.tsx:187
   className={cn(
     'text-2xl font-bold',
     isValidTendered ? 'text-green-600 dark:text-green-400' : 'text-destructive'
   )}
   // Consider adding a 'success' semantic token to globals.css
   ```

9. **Extract skeleton count:**
   ```typescript
   // common/constants/ui.ts
   export const SKELETON_DEFAULTS = {
     GRID_COUNT: 8,
     LIST_COUNT: 3,
   } as const;
   ```

---

## 6. Testing Recommendations

### Unit Tests Needed

1. **useSalesCart hook:** Test auto-session creation flow
2. **CartItem:** Test quantity increment/decrement edge cases
3. **PaymentPanel:** Test change calculation, validation
4. **QuickAddDialog:** Test customization price calculation

### Integration Tests Needed

1. **Sales page flow:** Add item → Checkout → Payment → Receipt
2. **Table session flow:** Select table → Start session → Add items
3. **Error handling:** API failures at each stage

---

## 7. Documentation Notes

The `sales.types.ts` file has excellent JSDoc comments explaining each type. This pattern should be continued for new additions.

---

## Checklist Before Merge

- [ ] Remove mock `getTablesWithStatus` function and integrate real API
- [ ] Remove `console.log` from TablesView
- [ ] Add payment method translations to all 4 locale files
- [ ] Fix direct store state access in `handleTableSessionStart`
- [ ] Run `npm run lint` - ensure 0 warnings
- [ ] Run `npm run check-types` - ensure 0 errors
- [ ] Run `npm run build` - ensure successful build
- [ ] Manual test: Quick sale flow (add → checkout → pay → receipt)
- [ ] Manual test: Tables view (when backend ready)

---

_Review generated by Claude Code_
