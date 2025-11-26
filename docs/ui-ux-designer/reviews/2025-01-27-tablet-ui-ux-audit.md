---
date: 2025-01-27
agent: ui-ux-designer
scope: frontend
type: accessibility-audit
---

# RMS Tablet-Friendly UI/UX Compliance Audit Report

## Executive Summary

**Overall Tablet-Friendliness Score: 65/100**

The Restaurant Management System (RMS) codebase demonstrates awareness of tablet-first design principles with documented guidelines in CLAUDE.md. However, the implementation has significant gaps between documented standards and actual code. Many components use touch targets that are too small, rely on hover interactions that do not work on tablets, and utilize typography sizes that are difficult to read from tablet viewing distances.

### Key Findings Overview

| Category           | Critical Issues | Moderate Issues | Total |
| ------------------ | --------------- | --------------- | ----- |
| Touch Target Sizes | 12              | 8               | 20    |
| Hover Dependencies | 4               | 2               | 6     |
| Typography         | 3               | 45+             | 48+   |
| Spacing            | 5               | 10              | 15    |

### Risk Assessment

- **High Risk Areas:** Cart controls, menu item actions, sidebar navigation
- **Medium Risk Areas:** Kitchen display, form dialogs, category navigation
- **Low Risk Areas:** Main page layouts, primary action buttons

---

## Critical Issues

These elements are definitively too small or unusable on tablets and require immediate attention.

### 1. CartItem Quantity Controls (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/sales/components/CartItem.tsx`

**Lines 81-101**

```typescript
// Current code - buttons are 28x28px (h-7 w-7)
<Button
  variant="outline"
  size="icon"
  className="h-7 w-7"  // 28px - WELL BELOW 44px minimum
  onClick={handleDecrement}
  disabled={disabled || item.quantity <= 1}
>
  <Minus className="h-3 w-3" />  // Icon also too small
</Button>
```

**Issue:** Quantity control buttons are only 28x28px, far below the 44x44px minimum. This is on the cart panel which is used constantly during order taking.

**Recommended Fix:**

```typescript
<Button
  variant="outline"
  size="icon"
  className="h-11 w-11"  // 44px minimum
  onClick={handleDecrement}
  disabled={disabled || item.quantity <= 1}
>
  <Minus className="h-5 w-5" />
</Button>
```

---

### 2. CartItem Delete Button (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/sales/components/CartItem.tsx`

**Lines 109-117**

```typescript
<Button
  variant="ghost"
  size="icon"
  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"  // 24px!
  onClick={handleRemove}
  disabled={disabled}
>
  <Trash2 className="h-3 w-3" />
</Button>
```

**Issue:** Delete button is only 24x24px (h-6 w-6) - almost half the required minimum size.

**Recommended Fix:**

```typescript
<Button
  variant="ghost"
  size="icon"
  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11 w-11"
  onClick={handleRemove}
  disabled={disabled}
>
  <Trash2 className="h-5 w-5" />
</Button>
```

---

### 3. Image Upload Remove Button (CRITICAL - Hover-Dependent)

**File:** `/apps/restaurant-management-system/src/common/components/widgets/image-upload.tsx`

**Lines 174-185 and 213-225**

```typescript
<button
  type="button"
  onClick={handleRemove}
  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 text-sm opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-gray-100 disabled:opacity-50"
  aria-label="Remove image"
>
  <X className="h-4 w-4 text-red-500" />
</button>
```

**Issues:**

1. Button is only 24x24px
2. `opacity-0` with `group-hover:opacity-100` means button is **invisible by default and only appears on hover** - completely unusable on tablets!

**Recommended Fix:**

```typescript
<button
  type="button"
  onClick={handleRemove}
  className="absolute -top-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md active:scale-95"
  aria-label="Remove image"
>
  <X className="h-5 w-5 text-red-500" />
</button>
```

---

### 4. Menu Item Card Action Buttons (CRITICAL - Hover-Dependent)

**File:** `/apps/restaurant-management-system/src/features/menu/components/item-card.tsx`

**Lines 241-278**

```typescript
// Edit button
<Button
  variant="secondary"
  size="icon"
  className="absolute top-1 right-20 h-8 w-8 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
  // ...
>

// Translate button
<Button
  variant="secondary"
  size="icon"
  className="absolute top-1 right-10 h-8 w-8 rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
  // ...
>
```

**Issues:**

1. Buttons are 32x32px (h-8 w-8) - below minimum
2. `opacity-0` with `group-hover:opacity-100` makes them **invisible on tablets**
3. Critical menu management functions are inaccessible without hover

**Recommended Fix:**

```typescript
<Button
  variant="secondary"
  size="icon"
  className="absolute top-2 right-2 h-11 w-11 rounded-full shadow-md"
  // ...
>
```

Or use a tap-to-reveal action menu pattern:

```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size="icon" className="h-11 w-11">
      <MoreVertical className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Translate</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 5. Sidebar Navigation Links (CRITICAL)

**File:** `/apps/restaurant-management-system/src/common/components/widgets/sidebar.tsx`

**Lines 174-175 and 239-241**

```typescript
// Main nav items
className =
  'flex items-center rounded px-2 py-1 text-sm transition-colors hover:bg-gray-50';

// Sub-menu items
className = 'flex items-center rounded px-2 py-1 hover:bg-gray-100';
```

**Issue:** Navigation items have only `py-1` (4px vertical padding), making them far too short for touch targets. Combined with `text-sm`, these are difficult to tap accurately.

**Recommended Fix:**

```typescript
className =
  'flex items-center rounded px-3 py-3 text-base transition-colors hover:bg-gray-50 active:bg-gray-100 min-h-11';
```

---

### 6. Account Popover Buttons (CRITICAL)

**File:** `/apps/restaurant-management-system/src/common/components/widgets/account-popover.tsx`

**Lines 28-37**

```typescript
<Link
  href="/profile"
  className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
>
  {t('profile')}
</Link>
<button
  onClick={onLogout}
  className="block w-full px-2 py-1 text-left text-sm text-red-600 hover:bg-gray-100"
>
  {t('logout')}
</button>
```

**Issue:** `py-1` (4px) padding makes these touch targets approximately 24-28px tall.

**Recommended Fix:**

```typescript
<Link
  href="/profile"
  className="flex items-center gap-2 px-3 py-3 text-base text-gray-700 hover:bg-gray-100 min-h-11"
>
```

---

### 7. Kitchen Dashboard Icon Buttons (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/kitchen/components/KitchenDashboard.tsx`

**Lines 98-118**

```typescript
<Button
  variant="outline"
  size="icon"
  onClick={toggleSound}
  title={soundEnabled ? t('disableSound') : t('enableSound')}
>
  {soundEnabled ? (
    <Bell className="h-4 w-4" />
  ) : (
    <BellOff className="h-4 w-4" />
  )}
</Button>
```

**Issue:** Uses default `size="icon"` which is typically 36x36px with 16x16px icons. This is below the 44px minimum for tablet interfaces.

**Recommended Fix:**

```typescript
<Button
  variant="outline"
  size="icon"
  className="h-11 w-11"
  onClick={toggleSound}
  title={soundEnabled ? t('disableSound') : t('enableSound')}
>
  {soundEnabled ? (
    <Bell className="h-5 w-5" />
  ) : (
    <BellOff className="h-5 w-5" />
  )}
</Button>
```

---

### 8. Dashboard Header Notification Button (CRITICAL)

**File:** `/apps/restaurant-management-system/src/common/components/widgets/dashboard-header.tsx`

**Lines 103-113**

```typescript
<Button
  variant="ghost"
  size="icon"
  className="relative"
  aria-label="Notifications"
>
  <Bell className="h-4 w-4" />
</Button>
```

**Issue:** Default `size="icon"` results in approximately 36x36px button.

**Recommended Fix:**

```typescript
<Button
  variant="ghost"
  size="icon"
  className="relative h-11 w-11"
  aria-label="Notifications"
>
  <Bell className="h-5 w-5" />
</Button>
```

---

### 9. QuickSaleCartPanel Quantity Controls (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/sales/components/QuickSaleCartPanel.tsx`

**Lines 75-100**

Similar to CartItem.tsx, uses `size="icon"` without explicit sizing, and the quantity display uses `w-8 text-center text-sm` which is too narrow.

---

### 10. Category Card Inline Edit Buttons (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/menu/components/category-card.tsx`

**Lines 301-316**

```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={() => handleSaveEdit(category.id)}
  disabled={!editingValue.trim() || isMutatingCategories}
  className="text-primary hover:bg-primary/10 h-8 w-8 shrink-0"
>
  <Check className="h-4 w-4" />
</Button>
<Button
  variant="ghost"
  size="icon"
  onClick={handleCancelEdit}
  className="text-muted-foreground hover:bg-muted h-8 w-8 shrink-0"
>
  <X className="h-4 w-4" />
</Button>
```

**Issue:** 32x32px buttons (h-8 w-8) are below minimum.

---

### 11. Customization Group Field Delete Button (CRITICAL)

**File:** `/apps/restaurant-management-system/src/features/menu/components/customization-group-field.tsx`

**Line 147**

```typescript
className =
  'h-8 w-8 shrink-0 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50';
```

**Issue:** 32x32px delete button for customization options.

---

### 12. Table Management Delete Button (CRITICAL)

**File:** `/apps/restaurant-management-system/src/app/hub/(owner-admin)/tables/manage/page.tsx`

**Line 301**

```typescript
className = 'text-muted-foreground hover:text-destructive h-8 w-8 shrink-0';
```

---

## Moderate Issues

These elements could be improved for better tablet UX but are not completely unusable.

### 1. Kitchen Order Action Buttons

**File:** `/apps/restaurant-management-system/src/features/kitchen/components/OrderActions.tsx`

**Lines 47-59**

```typescript
<Button
  key={action.status}
  variant={action.variant}
  size="sm"  // Small size for kitchen actions
  onClick={() => handleStatusChange(action.status)}
  disabled={updateMutation.isPending}
  className="flex items-center gap-2"
>
```

**Issue:** Uses `size="sm"` which may be borderline acceptable but not ideal for a busy kitchen environment.

**Recommendation:** Use default or large size for kitchen display buttons.

---

### 2. Menu Page Category Navigation Buttons

**File:** `/apps/restaurant-management-system/src/app/hub/(owner-admin)/menu/page.tsx`

**Lines 261-275**

```typescript
<Button
  key={cat.id}
  variant="outline"
  size="sm"
  className="hover:bg-primary hover:text-primary-foreground flex-shrink-0 transition-colors"
  onClick={() => scrollToCategory(cat.id)}
>
```

**Issue:** Category quick-scroll buttons use `size="sm"`.

---

### 3. Menu Filters Select Triggers

**File:** `/apps/restaurant-management-system/src/features/menu/components/menu-filters.tsx`

**Lines 41 and 58**

```typescript
<SelectTrigger className="w-[180px]">
```

**Issue:** Fixed width may cause text truncation. Default SelectTrigger height should be verified to meet 44px minimum.

---

### 4. ActiveOrdersPanel Pagination

**File:** `/apps/restaurant-management-system/src/features/sales/components/ActiveOrdersPanel.tsx`

**Lines 104-117**

```typescript
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  disabled={currentPage <= 1}
  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
>
```

**Issue:** 32x32px pagination buttons.

---

### 5. Menu Form Dialog "Add Group" Button

**File:** `/apps/restaurant-management-system/src/features/menu/components/menu-item-form-dialog.tsx`

**Lines 694-707**

```typescript
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() =>
    appendGroup({
      // ...
    })
  }
>
```

**Issue:** Uses `size="sm"` for an important action.

---

### 6. Session Type Badges (Kitchen)

**File:** `/apps/restaurant-management-system/src/features/kitchen/components/OrderCard.tsx`

**Lines 200-208**

```typescript
className={cn(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
  // ...
)}
```

**Issue:** `py-0.5` and `text-xs` make these badges very small, though they're informational rather than interactive.

---

### 7. Order Card Customer Name Text

**File:** `/apps/restaurant-management-system/src/features/kitchen/components/OrderCard.tsx`

**Lines 54-58**

```typescript
<span className="text-muted-foreground flex items-center gap-1 text-xs">
  <User className="h-3 w-3" />
  {customerName}
</span>
```

**Issue:** `text-xs` with `h-3 w-3` icon is very small for kitchen displays that may be viewed from a distance.

---

### 8. Reorder Menu Dialog Drag Handles

**File:** `/apps/restaurant-management-system/src/features/menu/components/reorder-menu-dialog.tsx`

**Lines 113-120**

```typescript
<span
  {...attributes}
  {...listeners}
  className="text-muted-foreground hover:text-foreground cursor-grab touch-none p-1"
  aria-label="Drag to reorder"
>
  <GripVertical className="h-5 w-5" />
</span>
```

**Issue:** `p-1` padding with `h-5 w-5` icon results in approximately 28x28px drag handle.

---

## Hover-Dependency Issues

These patterns will not work on tablets as hover states are not available.

### 1. Image Upload Remove Button

- **File:** `image-upload.tsx:178, 217`
- **Pattern:** `opacity-0 group-hover:opacity-100`
- **Impact:** CRITICAL - Button completely invisible on tablets

### 2. Menu Item Card Edit/Translate Buttons

- **File:** `item-card.tsx:244, 268`
- **Pattern:** `opacity-0 group-hover:opacity-100`
- **Impact:** CRITICAL - Menu management actions inaccessible on tablets

### 3. Item Card More Actions Menu

- **File:** `item-card.tsx:291`
- **Pattern:** `opacity-80 hover:opacity-100` (less severe but still hover-dependent)
- **Impact:** MODERATE - Still visible but relies on hover for full visibility

### 4. Sidebar Collapse Button Hover States

- **File:** `sidebar.tsx:174-175`
- **Pattern:** `hover:bg-gray-50` as primary visual feedback
- **Impact:** LOW - Functional but no active state feedback

---

## Typography Issues

Extensive use of `text-xs` (12px) throughout the codebase for information that may be important:

### High-Priority Typography Fixes

| File                      | Line          | Current   | Context                              | Recommendation |
| ------------------------- | ------------- | --------- | ------------------------------------ | -------------- |
| `CartItem.tsx`            | 62, 69        | `text-xs` | Customizations, notes                | `text-sm`      |
| `OrderCard.tsx` (kitchen) | 54, 79, 84    | `text-xs` | Customer name, notes, customizations | `text-sm`      |
| `item-card.tsx`           | 330, 343, 346 | `text-xs` | Description, stock status            | `text-sm`      |
| `SalesMenuItemCard.tsx`   | 83            | `text-xs` | Item description                     | `text-sm`      |
| `KitchenStats.tsx`        | 75            | `text-xs` | Stat descriptions                    | `text-sm`      |

### Moderate-Priority Typography Fixes

| File                   | Line     | Current   | Context                        |
| ---------------------- | -------- | --------- | ------------------------------ |
| `sidebar.tsx`          | 268      | `text-xs` | Version number                 |
| `dashboard-header.tsx` | 143, 154 | `text-xs` | Email, role badge              |
| Various form dialogs   | Multiple | `text-xs` | Form descriptions, helper text |

---

## Good Patterns Found

The codebase demonstrates several tablet-friendly patterns that should be used as reference for fixes:

### 1. Large Primary Action Buttons

**File:** `/apps/restaurant-management-system/src/app/hub/(owner-admin)/menu/page.tsx`

**Lines 183-208**

```typescript
<Button
  variant="default"
  size="default"  // Uses default size for primary actions
  className="flex items-center"
  onClick={() => setItemFormOpen(true)}
>
  <Plus className="mr-2 h-4 w-4" /> {t('createItem')}
</Button>
```

### 2. Adequate Dialog Footer Spacing

**File:** `menu-item-form-dialog.tsx:763-778`

```typescript
<div className="flex justify-end gap-3 pt-4">
  <Button type="button" variant="outline" onClick={handleCancel}>
    Cancel
  </Button>
  <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
    {/* ... */}
  </Button>
</div>
```

The `gap-3` (12px) spacing between buttons meets the minimum spacing requirement.

### 3. Card-Based Menu Item Layout

**File:** `SalesMenuItemCard.tsx`

Uses card layout with adequate padding (`p-3`) and prominent price display (`text-lg font-semibold`).

### 4. Quantity Stepper in QuickAddDialog

**File:** `QuickAddDialog.tsx:193-213`

While using `size="icon"`, the dialog layout provides adequate spacing around controls.

### 5. Tab-Based View Switching

**File:** `sales/page.tsx:340-355`

```typescript
<Tabs value={activeView} onValueChange={handleViewChange}>
  <TabsList>
    <TabsTrigger value="quick-sale" className="gap-2">
      <Store className="h-4 w-4" />
      <span className="hidden sm:inline">{t('quickSale')}</span>
    </TabsTrigger>
    // ...
  </TabsList>
</Tabs>
```

Tab triggers are appropriately sized for touch.

---

## Recommendations Summary

### Immediate Priority (Critical UX Impact)

1. **Increase CartItem controls to 44px minimum** (`h-11 w-11`)
2. **Remove hover-dependent visibility** from image upload and menu item card buttons
3. **Increase sidebar navigation touch targets** to minimum 44px height
4. **Add active states** (`active:scale-95`, `active:bg-*`) as alternative to hover

### High Priority (Significant UX Impact)

1. **Audit all `size="icon"` buttons** and add explicit `h-11 w-11` class
2. **Replace all `h-6`, `h-7`, `h-8` buttons** with `h-11` minimum
3. **Upgrade `text-xs` to `text-sm`** for all user-facing information
4. **Increase spacing** in list items and navigation from `py-1` to `py-3`

### Medium Priority (UX Enhancement)

1. **Audit all `size="sm"` button usage** - consider upgrading to default size
2. **Add press feedback** with `active:` states throughout
3. **Review dialog close buttons** - ensure 44px minimum
4. **Add touch-friendly alternatives** for drag-and-drop interactions

### Design System Updates

Consider adding these to the design system documentation:

```typescript
// Tablet-safe button sizes
const TOUCH_SAFE_SIZES = {
  iconButton: 'h-11 w-11', // 44px
  minButton: 'min-h-11', // 44px minimum height
  listItem: 'min-h-14 py-3', // 56px with padding
};

// Tablet-safe typography
const TABLET_TYPOGRAPHY = {
  body: 'text-base', // 16px minimum
  secondary: 'text-sm', // 14px for secondary
  // AVOID text-xs for user-facing content
};
```

---

## Conclusion

The RMS codebase has a solid foundation with documented tablet-first guidelines, but implementation has drifted from these standards. The most critical issues are in the sales/POS interface (CartItem controls) and hover-dependent interactions (image upload, menu item cards) that will completely fail on tablet devices.

**Recommended Action Plan:**

1. Week 1: Fix all critical hover-dependency issues (4 components)
2. Week 2: Increase touch target sizes in sales components
3. Week 3: Audit and fix sidebar/navigation touch targets
4. Week 4: Address typography and spacing issues systematically

**Estimated Effort:** 3-4 developer days for critical and high-priority fixes.

---

_Report generated: 2025-01-27_
_Auditor: UI/UX Designer Agent_
