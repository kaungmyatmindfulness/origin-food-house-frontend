# Code Review: Stash Order Feature

**Date:** 2025-12-06
**Reviewer:** Claude
**Feature:** Order stashing functionality for Quick Sale POS

## Overview

This review covers the implementation of an order stashing feature that allows POS staff to temporarily save (stash) cart orders and restore them later. This is a common POS workflow for handling situations like:
- Customer stepping away temporarily
- Phone orders that need to wait
- Switching between multiple customer orders

### Files Changed

| File | Change Type | Lines |
|------|-------------|-------|
| `QuickSaleCartPanel.tsx` | Modified | +189 lines |
| `SaveIndicator.tsx` | Deleted | -123 lines |
| `index.ts` | Modified | -1 line |
| `StashDialog.tsx` | New | 122 lines |
| `StashedOrdersSheet.tsx` | New | 111 lines |
| `StashedOrderCard.tsx` | New | 92 lines |
| `RestoreConflictDialog.tsx` | New | 125 lines |
| `stash.store.ts` | New | 176 lines |
| `useStashStore.ts` | New | 72 lines |
| `messages/*/sales.json` | Modified | +38 lines each (4 files) |

---

## 1. Code Quality & Standards

### Strengths

1. **Proper Feature-Sliced Design**: Components are well-organized within `features/sales/components/` with a dedicated store and hook

2. **Complete i18n Coverage**: All 4 locales (en, zh, my, th) have translations added

3. **Proper TypeScript Usage**:
   - Props interfaces defined with `{ComponentName}Props` pattern
   - Type exports from store (`StashedOrder`, `StashStore`)
   - Proper use of `import type`

4. **Touch-Friendly UI**: Buttons use proper `h-11`/`h-12` classes meeting 44px minimum touch targets

5. **Component Composition**: The feature is well-decomposed:
   - `StashDialog` - Stash with note
   - `StashedOrdersSheet` - List stashed orders
   - `StashedOrderCard` - Individual stashed order display
   - `RestoreConflictDialog` - Handle restore conflicts

### Areas for Improvement

1. **Magic Number**: `MAX_NOTE_LENGTH = 50` in `StashDialog.tsx` should be in a constants file

2. **Duplicate Code Pattern**: Item restoration logic is repeated 3 times in `handleConflictAction` (lines 195-240 in QuickSaleCartPanel.tsx)

---

## 2. Correctness & Logic

### Strengths

1. **Conflict Handling**: Smart handling when restoring to a non-empty cart with 3 options:
   - Replace current cart
   - Merge orders
   - Stash current first, then restore

2. **Store Isolation**: Stash store is properly scoped per `storeId` with separate localStorage keys

3. **Data Integrity**: Deep cloning cart items when stashing/restoring to prevent reference issues

4. **Limit Enforcement**: `MAX_STASHED_ORDERS = 15` prevents unbounded storage growth

### Potential Issues

1. **Memory Leak in Store Instance Cache** (`useStashStore.ts:18`):
   ```typescript
   const storeInstances = new Map<string, StashStore>();
   ```
   Store instances are never removed from the Map. If a user switches between many stores, instances accumulate. Consider using WeakRef or cleanup on unmount.

2. **Missing Error Handling**: `restoreOrder` returns `null` on failure but the consumer (`handleRestoreOrder`) doesn't handle this case gracefully - it just silently fails to show the toast.

3. **Race Condition Risk**: In `handleConflictAction`, `restoreOrder(pendingRestoreId)` removes the order from stash, but if any subsequent operation fails (like adding items), the order is already deleted.

---

## 3. Priority Issues

### P0 - Must Fix Before Commit

**None identified** - No security vulnerabilities, breaking changes, or data loss risks.

### P1 - Should Fix

| Issue | Location | Description |
|-------|----------|-------------|
| Duplicate restoration logic | `QuickSaleCartPanel.tsx:195-240` | The `addItem` loop is repeated 3 times in switch cases. Extract to helper function. |
| Missing null check | `QuickSaleCartPanel.tsx:165-175` | `handleRestoreOrder` doesn't show error toast when `restoreOrder` fails |
| Unused ref | `useStashStore.ts:44-45` | `storeIdRef` is set but never read |

### P2 - Nice to Fix

| Issue | Location | Description |
|-------|----------|-------------|
| Magic number | `StashDialog.tsx:29` | `MAX_NOTE_LENGTH = 50` should be in constants file |
| Console.warn usage | `stash.store.ts:89,121` | Consider using proper logging pattern |
| Type export not used | `stash.store.ts:165` | `StashStore` type is defined but selectors could use explicit typing |

### P3 - Optional

| Issue | Location | Description |
|-------|----------|-------------|
| Store cache cleanup | `useStashStore.ts:18` | Consider cleanup mechanism for store instances |
| Accessibility | `StashedOrderCard.tsx:44-48` | Card uses onClick for restore - consider adding keyboard handler |

---

## 4. Architecture & Impact

### Dependencies

- **Zustand**: Properly used with `devtools`, `persist`, and `immer` middleware
- **date-fns**: `formatDistanceToNow` for relative time display
- **@repo/ui**: Using proper shared components (Dialog, Sheet, AlertDialog, etc.)

### Performance Considerations

1. **localStorage Usage**: Each stashed order stores full cart items including customizations. With 15 orders max and complex items, this could approach localStorage limits (5MB). Consider:
   - Compressing data
   - Limiting customization depth in stash

2. **Deep Cloning**: `JSON.parse(JSON.stringify(items))` is used for deep cloning. For large orders, consider `structuredClone()` which is more performant.

### Security

- **No concerns identified**: Data is stored in localStorage per-store, no sensitive information exposed

### Coupling

- Tight coupling between `QuickSaleCartPanel` and stash functionality. The panel now handles both cart and stash concerns. Consider extracting stash-related handlers to a custom hook.

---

## 5. Actionable Recommendations

### High Priority

1. **Extract Item Restoration Helper** (`QuickSaleCartPanel.tsx`):
   ```typescript
   const restoreItemsToCart = useCallback(
     (items: DraftCartItem[]) => {
       items.forEach((item) => {
         addItem({
           menuItemId: item.menuItemId,
           menuItemName: item.menuItemName,
           menuItemImage: item.menuItemImage,
           basePrice: item.basePrice,
           quantity: item.quantity,
           customizations: item.customizations,
           notes: item.notes,
         });
       });
     },
     [addItem]
   );
   ```

2. **Add Error Handling for Failed Restore**:
   ```typescript
   const handleRestoreOrder = useCallback((id: string) => {
     // ... existing logic
     const restoredItems = restoreOrder(id);
     if (!restoredItems) {
       toast.error(t('stash.restoreError')); // Add translation
       return;
     }
     // ... continue
   }, [/* deps */]);
   ```

3. **Remove Unused Ref** (`useStashStore.ts:44-45`):
   ```typescript
   // DELETE these lines:
   const storeIdRef = useRef(storeId);
   storeIdRef.current = storeId;
   ```

### Medium Priority

4. **Create Constants File** (`features/sales/constants/stash.constants.ts`):
   ```typescript
   export const MAX_STASH_NOTE_LENGTH = 50;
   export const MAX_STASHED_ORDERS = 15;
   ```

5. **Add Keyboard Support** (`StashedOrderCard.tsx`):
   ```typescript
   <Card
     className="hover:bg-accent/50 cursor-pointer ..."
     onClick={handleRestore}
     onKeyDown={(e) => e.key === 'Enter' && handleRestore()}
     tabIndex={0}
     role="button"
   >
   ```

### Low Priority

6. **Use structuredClone** (`stash.store.ts`):
   ```typescript
   // Replace:
   items: JSON.parse(JSON.stringify(items))
   // With:
   items: structuredClone(items)
   ```

7. **Extract Stash Handlers to Custom Hook**: Create `useStashActions.ts` to handle stash/restore/conflict logic, keeping `QuickSaleCartPanel` focused on rendering.

---

## Summary

**Overall Assessment:** Good implementation with proper patterns

| Aspect | Rating |
|--------|--------|
| Code Quality | 4/5 |
| Architecture | 4/5 |
| Type Safety | 5/5 |
| i18n | 5/5 |
| Touch Accessibility | 5/5 |
| Error Handling | 3/5 |

The stash feature is well-implemented following project conventions. The main concerns are:
1. Duplicate code that should be extracted
2. Missing error handling for edge cases
3. Minor cleanup items (unused ref, magic numbers)

**Recommendation:** Address P1 issues before committing, P2 can be done in follow-up.
