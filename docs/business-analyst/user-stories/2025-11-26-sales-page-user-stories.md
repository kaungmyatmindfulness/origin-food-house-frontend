---
date: 2025-11-26
agent: business-analyst-product-owner
scope: full-stack
type: user-stories
feature: Sales Page Enhancement
---

# Sales Page User Stories

## Document Overview

This document contains user stories for the Origin Food House Sales Page enhancement, derived from the Business Requirements Document (BRD) dated 2025-11-26. Stories are organized by epic and follow the standard format with acceptance criteria in Given/When/Then format.

### Personas

| Persona         | Description                                                                           | Permission Level                              |
| --------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Cashier**     | Frontline staff handling day-to-day operations including orders, tables, and payments | Standard                                      |
| **Owner/Admin** | Restaurant owner or administrator with full system access                             | Privileged (includes all Cashier permissions) |

> **Note:** Stories written for "Cashier" automatically apply to Owner/Admin as well, since Owner/Admin has all Cashier permissions plus additional privileged operations.

### Priority Legend (MoSCoW)

| Priority   | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| **MUST**   | Essential for MVP - system cannot function without it |
| **SHOULD** | Important but not critical - significant value add    |
| **COULD**  | Desirable - nice to have if time permits              |

### Effort Legend

| Effort | Duration  | Complexity                                  |
| ------ | --------- | ------------------------------------------- |
| **S**  | 1-2 days  | Simple, well-defined task                   |
| **M**  | 3-5 days  | Moderate complexity, some unknowns          |
| **L**  | 1-2 weeks | Complex, multiple components involved       |
| **XL** | 2+ weeks  | Very complex, significant architecture work |

---

## Epic 1: Quick Sale

The Quick Sale feature enables fast counter service by providing an intuitive menu grid with category filtering and instant cart updates.

### US-SALE-001: View Menu Items in Grid Layout

**As a** Cashier
**I want to** view all available menu items in a responsive grid layout
**So that** I can quickly find and select items for customer orders

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when the page loads, then I should see menu items displayed in a responsive grid (3-4 columns on desktop, 2 columns on tablet)
- [ ] Given menu items are displayed, when I view an item card, then I should see the item name, price, and an "Add" button
- [ ] Given menu items exist, when I view the grid, then items should be sorted by their configured display order
- [ ] Given a menu item is marked as out-of-stock, when I view the grid, then that item should display an "Out of Stock" indicator and the Add button should be disabled
- [ ] Given menu items are loading, when I view the page, then I should see skeleton placeholders instead of a blank screen
- [ ] Given I have a slow connection, when items load, then each item should appear as soon as its data is available (progressive loading)

**Priority:** MUST
**Effort:** M
**Dependencies:** Menu service must be available with active menu items

**Notes:**

- Menu items should be fetched using React Query with appropriate caching
- Consider implementing infinite scroll or pagination for stores with large menus (100+ items)

---

### US-SALE-002: Filter Menu Items by Category

**As a** Cashier
**I want to** filter menu items by category using a horizontal category bar
**So that** I can quickly narrow down items when I know what type of food the customer wants

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when categories load, then I should see a horizontal scrollable category bar above the menu grid
- [ ] Given categories are displayed, when I tap "All", then all menu items should be shown (default state)
- [ ] Given categories are displayed, when I tap a specific category (e.g., "Appetizers"), then only items in that category should be displayed
- [ ] Given I have selected a category, when I tap a different category, then the filter should change and the grid should update immediately
- [ ] Given I have selected a category, when that category is active, then it should be visually highlighted (primary color)
- [ ] Given there are many categories, when they exceed the viewport width, then I should be able to scroll horizontally to see all categories
- [ ] Given I filter by a category, when no items match, then I should see an empty state message "No items in this category"

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-001

**Notes:**

- Categories should be fetched from the existing category service
- Consider caching categories longer (5+ minutes) as they change infrequently

---

### US-SALE-003: Search Menu Items

**As a** Cashier
**I want to** search for menu items by name
**So that** I can find specific items quickly without browsing through categories

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I view the menu section, then I should see a search input field at the top
- [ ] Given the search field is visible, when I type 2 or more characters, then the menu grid should filter to show matching items in real-time (within 300ms)
- [ ] Given I am searching, when I type "Pad", then items containing "Pad" in their name should appear (e.g., "Pad Thai", "Pad See Ew")
- [ ] Given I have typed a search term, when I clear the search field, then all items should be displayed again
- [ ] Given I have a search term active, when I also select a category, then both filters should apply (AND logic)
- [ ] Given I search for a term with no matches, when results display, then I should see "No items found for '[search term]'"
- [ ] Given I am typing quickly, when keystrokes occur rapidly, then search should be debounced to avoid excessive API calls (300ms debounce)

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-001

**Notes:**

- Search should be client-side filtering on already-loaded menu items for performance
- Use the existing `useDebouncedValue` hook for debouncing

---

### US-SALE-004: Add Item to Cart

**As a** Cashier
**I want to** add menu items to the cart with a single tap
**So that** I can build customer orders quickly without friction

**Acceptance Criteria:**

- [ ] Given I am viewing menu items, when I tap the "Add" button on an item card, then that item should be added to the cart immediately
- [ ] Given an item is not yet in the cart, when I add it, then it should appear in the cart panel with quantity 1
- [ ] Given an item is already in the cart with quantity 2, when I add it again from the grid, then the quantity should increase to 3
- [ ] Given I add an item, when the cart updates, then the cart total should recalculate immediately (optimistic UI)
- [ ] Given I add an item, when successful, then I should see a brief visual feedback on the item card (e.g., checkmark animation)
- [ ] Given I add an item, when the item has required modifiers/options, then a modifier selection dialog should open first
- [ ] Given the cart is empty, when I add the first item, then the cart panel should transition from empty state to showing the item

**Priority:** MUST
**Effort:** M
**Dependencies:** US-SALE-001, Cart state management (Zustand store)

**Notes:**

- Use optimistic updates for instant feedback
- Cart state should persist in localStorage to survive page refresh

---

### US-SALE-005: View and Manage Cart

**As a** Cashier
**I want to** view the current cart with all items, quantities, and pricing breakdown
**So that** I can review the order before proceeding to payment

**Acceptance Criteria:**

- [ ] Given the cart panel is visible, when I have items in the cart, then I should see each item with: name, quantity, unit price, line total
- [ ] Given an item is in the cart, when I tap the "+" button, then the quantity should increase by 1
- [ ] Given an item is in the cart with quantity > 1, when I tap the "-" button, then the quantity should decrease by 1
- [ ] Given an item is in the cart with quantity 1, when I tap the "-" button, then the item should be removed from the cart
- [ ] Given an item is in the cart, when I tap the "Remove" button, then the item should be removed regardless of quantity
- [ ] Given items are in the cart, when I view the cart, then I should see: Subtotal, VAT (7%), Service Charge (10%), and Total
- [ ] Given the cart total changes, when calculations complete, then all amounts should be formatted to 2 decimal places with currency symbol
- [ ] Given the cart is empty, when I view the cart panel, then I should see "Cart is empty - Add items from the menu"

**Priority:** MUST
**Effort:** M
**Dependencies:** US-SALE-004

**Notes:**

- Tax and service charge percentages should come from store settings
- Consider using a swipe-to-remove gesture for mobile/tablet

---

### US-SALE-006: Clear Cart

**As a** Cashier
**I want to** clear all items from the cart with a single action
**So that** I can start over if the customer changes their mind or a mistake was made

**Acceptance Criteria:**

- [ ] Given items are in the cart, when I view the cart panel, then I should see a "Clear Cart" button
- [ ] Given I tap the "Clear Cart" button, when the confirmation dialog appears, then I should see "Are you sure you want to clear the cart? This action cannot be undone."
- [ ] Given the confirmation dialog is shown, when I tap "Cancel", then the cart should remain unchanged
- [ ] Given the confirmation dialog is shown, when I tap "Clear", then all items should be removed from the cart
- [ ] Given I clear the cart, when the operation completes, then the cart should show the empty state
- [ ] Given the cart is empty, when I view the cart panel, then the "Clear Cart" button should be disabled or hidden

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-005

---

### US-SALE-007: Select Order Type

**As a** Cashier
**I want to** select the order type (Counter, Takeaway, Phone Order)
**So that** the kitchen knows how to prepare and package the order

**Acceptance Criteria:**

- [ ] Given I am creating a new order, when I view the cart panel, then I should see an "Order Type" selector with options: Counter, Takeaway, Phone Order
- [ ] Given I have not selected an order type, when I view the cart, then "Counter" should be selected by default
- [ ] Given I select "Takeaway", when the order is sent to kitchen, then items should be flagged for takeaway packaging
- [ ] Given I select "Phone Order", when I confirm, then I should be prompted to enter customer name and phone number
- [ ] Given I have entered customer details for a phone order, when I view the cart, then the customer name should be displayed
- [ ] Given I change the order type, when I have items in the cart, then the items should remain unchanged

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-005, Existing ManualOrderDialog component

---

### US-SALE-008: Keyboard Shortcuts for Quick Sale

**As a** Cashier
**I want to** use keyboard shortcuts for common actions
**So that** I can work faster during busy periods without using the mouse

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I press Ctrl/Cmd + N, then a new quick sale order should start (clear cart if needed with confirmation)
- [ ] Given I am on the Sales Page, when I press Ctrl/Cmd + F, then the search input should be focused
- [ ] Given the search input is focused, when I press Escape, then the search should clear and the input should blur
- [ ] Given I have items in the cart, when I press Ctrl/Cmd + Enter, then the payment panel should open
- [ ] Given a confirmation dialog is open, when I press Enter, then the primary action should be triggered
- [ ] Given a dialog is open, when I press Escape, then the dialog should close
- [ ] Given I am on the Sales Page, when I press keys 1-9 while the category bar is focused, then the corresponding category should be selected

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-001 through US-SALE-006

**Notes:**

- Shortcuts should be documented in a help tooltip accessible via "?" key
- Ensure shortcuts don't conflict with browser defaults

---

## Epic 2: Payment Recording

Payment processing is record-only (no payment gateway integration). The system records payment method and calculates change for cash transactions.

### US-SALE-009: Open Payment Panel

**As a** Cashier
**I want to** open the payment panel to record a payment for the current order
**So that** I can complete the transaction and provide the customer with a receipt

**Acceptance Criteria:**

- [ ] Given I have items in the cart, when I tap the "Pay" button, then the payment panel should open
- [ ] Given the cart is empty, when I try to tap "Pay", then the button should be disabled
- [ ] Given the payment panel opens, when I view it, then I should see the order total prominently displayed
- [ ] Given the payment panel is open, when I view payment method options, then I should see: Cash, Card, Mobile/E-Wallet, Other
- [ ] Given the payment panel is open, when I tap outside the panel or press Escape, then the panel should close without processing

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-005

---

### US-SALE-010: Record Cash Payment with Change Calculation

**As a** Cashier
**I want to** record a cash payment and see the calculated change due
**So that** I can give the customer the correct change

**Acceptance Criteria:**

- [ ] Given I select "Cash" as payment method, when the payment panel updates, then I should see a numpad for entering the amount tendered
- [ ] Given the order total is $45.63, when I enter $50.00 as tendered, then the system should display "Change Due: $4.37"
- [ ] Given the order total is $45.63, when I enter $45.63 as tendered (exact), then the system should display "Change Due: $0.00"
- [ ] Given the order total is $45.63, when I enter $40.00 as tendered (insufficient), then I should see an error "Insufficient amount - need $5.63 more"
- [ ] Given the numpad is visible, when I tap quick amount buttons ($50, $100, $200), then the tendered amount should update to that value
- [ ] Given I have entered the tendered amount, when I tap "Complete Payment", then the payment should be recorded with: paymentMethod=CASH, amountPaid, amountTendered, changeGiven
- [ ] Given payment is recorded successfully, when the process completes, then the cart should clear and the order should be sent to kitchen

**Priority:** MUST
**Effort:** M
**Dependencies:** US-SALE-009, payment.service.ts

**Notes:**

- Change calculation: changeGiven = amountTendered - orderTotal
- Round to nearest cent (2 decimal places)

---

### US-SALE-011: Record Card/Mobile Payment

**As a** Cashier
**I want to** record a card or mobile payment with an optional reference number
**So that** I can track the payment for reconciliation purposes

**Acceptance Criteria:**

- [ ] Given I select "Card" as payment method, when the payment panel updates, then I should see an optional "Reference Number" input field
- [ ] Given I select "Mobile/E-Wallet" as payment method, when the payment panel updates, then I should see an optional "Reference Number" input field
- [ ] Given I have selected Card, when I leave the reference number blank and tap "Complete Payment", then the payment should be recorded successfully (reference is optional)
- [ ] Given I have selected Card, when I enter a reference number (e.g., "TXN-12345"), then the payment record should include this reference
- [ ] Given I complete a card/mobile payment, when the record is saved, then the payment should include: paymentMethod, amountPaid, referenceNumber (if provided)
- [ ] Given payment is recorded successfully, when the process completes, then the cart should clear and the order should be sent to kitchen

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-009, payment.service.ts

**Notes:**

- No payment gateway integration - this is purely for record keeping
- Reference number helps with end-of-day reconciliation against card terminal reports

---

### US-SALE-012: Record Other Payment Types

**As a** Cashier
**I want to** record alternative payment types (gift cards, vouchers, etc.)
**So that** I can handle any payment method the restaurant accepts

**Acceptance Criteria:**

- [ ] Given I select "Other" as payment method, when the payment panel updates, then I should see a "Notes" text field
- [ ] Given I select "Other", when I view the notes field, then I should see placeholder text "e.g., Gift card, Voucher, Staff meal"
- [ ] Given I have entered notes, when I tap "Complete Payment", then the payment should be recorded with the notes
- [ ] Given I select "Other" and leave notes blank, when I tap "Complete Payment", then a warning should appear "Please enter a note describing the payment type"

**Priority:** SHOULD
**Effort:** S
**Dependencies:** US-SALE-009

---

### US-SALE-013: Generate and Print Receipt

**As a** Cashier
**I want to** generate and print a receipt after payment
**So that** I can provide the customer with proof of purchase

**Acceptance Criteria:**

- [ ] Given payment is successfully recorded, when the process completes, then a receipt should be automatically generated
- [ ] Given a receipt is generated, when I view it, then it should contain: store name/address, order number, date/time, itemized list, subtotal, tax, service charge, discounts (if any), total, payment method, change given (if cash)
- [ ] Given a receipt is generated, when the print dialog appears, then the receipt should be formatted for standard thermal printer width (80mm)
- [ ] Given a receipt is displayed, when I tap "Print", then the browser print dialog should open with the receipt
- [ ] Given the receipt printed successfully, when I close the print dialog, then I should return to the Sales Page with an empty cart
- [ ] Given I want to reprint a receipt, when I search for the order and select it, then I should see a "Print Receipt" option

**Priority:** MUST
**Effort:** M
**Dependencies:** US-SALE-010, US-SALE-011

**Notes:**

- MVP uses browser print dialog (window.print())
- Phase 2 may add direct thermal printer integration

---

## Epic 3: Order Management

Order management enables cashiers to view, search, and track orders in real-time through WebSocket updates.

### US-SALE-014: View Active Orders Panel

**As a** Cashier
**I want to** see all active orders in a collapsible panel at the bottom of the screen
**So that** I can monitor order progress and take action when needed

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I view the bottom of the screen, then I should see an "Active Orders" panel
- [ ] Given the Active Orders panel is visible, when orders exist, then I should see them grouped by status: Preparing, Ready, Awaiting Payment
- [ ] Given an order is in "Preparing" status, when I view it, then it should display a yellow indicator
- [ ] Given an order is in "Ready" status, when I view it, then it should display a green indicator with a pulse animation
- [ ] Given an order is "Awaiting Payment", when I view it, then it should display an orange indicator
- [ ] Given an order card is displayed, when I view it, then I should see: order number, table name (or "Counter"/"Takeaway"), item count, time elapsed, status badge
- [ ] Given the Active Orders panel is open, when I tap the collapse toggle, then the panel should minimize to show only the header
- [ ] Given the Active Orders panel is collapsed, when I tap the expand toggle, then the panel should expand to show all orders

**Priority:** MUST
**Effort:** M
**Dependencies:** Order service, WebSocket integration

---

### US-SALE-015: Receive Real-Time Order Updates

**As a** Cashier
**I want to** see order status updates in real-time without refreshing the page
**So that** I know immediately when an order is ready

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when a new order is created (by me or another device), then it should appear in the Active Orders panel within 1 second
- [ ] Given an order is in "Preparing" status, when the kitchen marks it "Ready", then the order card should move to the "Ready" section with visual animation
- [ ] Given an order becomes "Ready", when the status changes, then I should hear an audio notification (ding sound)
- [ ] Given an order becomes "Ready", when the status changes, then I should see a toast notification "Order #[number] is ready!"
- [ ] Given an order is paid and completed, when the status changes to "Completed", then the order should be removed from the Active Orders panel
- [ ] Given I have the Sales Page open, when WebSocket reconnects after a disconnect, then the Active Orders panel should refresh to show current state

**Priority:** MUST
**Effort:** M
**Dependencies:** US-SALE-014, useOrderSocket hook, useKitchenSocket hook

**Notes:**

- Leverage existing Socket.IO infrastructure
- Consider adding a "mute notifications" toggle for noisy environments

---

### US-SALE-016: Search Orders

**As a** Cashier
**I want to** search for orders by order number or customer name
**So that** I can find past orders for reprints, refunds, or customer inquiries

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I tap the "Search" quick action or press Ctrl/Cmd + F, then an order search dialog should open
- [ ] Given the search dialog is open, when I enter an order number (e.g., "#1234"), then matching orders should display
- [ ] Given the search dialog is open, when I enter a customer name (for phone/takeaway orders), then matching orders should display
- [ ] Given search results are shown, when I view an order, then I should see: order number, date/time, items, total, payment status, order type
- [ ] Given search results are shown, when I tap an order, then I should see detailed order information with action buttons
- [ ] Given I view an order, when the order is paid, then I should see "Print Receipt" and "View Details" options
- [ ] Given I view an order, when the order is not yet paid, then I should see "Process Payment" option
- [ ] Given no orders match my search, when results display, then I should see "No orders found for '[search term]'"

**Priority:** MUST
**Effort:** M
**Dependencies:** Order service search API

---

### US-SALE-017: View Order Details

**As a** Cashier
**I want to** view the full details of any order
**So that** I can answer customer questions or prepare for refund requests

**Acceptance Criteria:**

- [ ] Given I select an order from search or Active Orders, when the details panel opens, then I should see all order information
- [ ] Given order details are shown, when I view the header, then I should see: order number, date/time created, order type, table (if applicable)
- [ ] Given order details are shown, when I view items, then I should see: item name, quantity, unit price, line total, any modifiers/notes
- [ ] Given order details are shown, when I view pricing, then I should see: subtotal, discounts (if any), tax, service charge, total
- [ ] Given order details are shown, when I view payment info, then I should see: payment status, payment method (if paid), amount paid, change given (if cash)
- [ ] Given order details are shown, when I view timestamps, then I should see: created time, last updated time, completed time (if applicable)

**Priority:** MUST
**Effort:** S
**Dependencies:** US-SALE-016

---

### US-SALE-018: Void Unpaid Order (Owner/Admin Only)

**As an** Owner/Admin
**I want to** void an unpaid order with a documented reason
**So that** I can cancel orders that were placed in error

**Acceptance Criteria:**

- [ ] Given I am a Cashier viewing an unpaid order, when I look for actions, then I should NOT see a "Void" option
- [ ] Given I am an Owner/Admin viewing an unpaid order, when I look for actions, then I should see a "Void Order" option
- [ ] Given I tap "Void Order", when the dialog opens, then I must enter a reason for voiding (required field)
- [ ] Given I enter a reason and confirm, when I tap "Void", then the system should require my Owner/Admin PIN
- [ ] Given I enter the correct PIN, when the void is processed, then the order should be marked as "VOIDED" and removed from active orders
- [ ] Given an order is voided, when I search for it later, then it should show as "VOIDED" with the reason and who voided it
- [ ] Given I enter an incorrect PIN, when validation fails, then I should see "Invalid PIN - please try again"

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-017, Owner/Admin authentication

---

## Epic 4: Table Management

Table management enables viewing floor maps, managing table sessions, joining tables for large groups, and marking items as takeaway while dining.

### US-SALE-019: View Table Floor Map

**As a** Cashier
**I want to** view a visual floor map of all tables with their current status
**So that** I can quickly see which tables are available or need attention

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I tap "Tables" quick action or press Ctrl/Cmd + T, then I should see the table floor map view
- [ ] Given the floor map is displayed, when I view it, then I should see all tables as cards in a grid layout
- [ ] Given a table is VACANT, when I view its card, then it should have a neutral/gray appearance
- [ ] Given a table is SEATED, when I view its card, then it should have a blue appearance with guest count
- [ ] Given a table is ORDERING, when I view its card, then it should have a purple appearance
- [ ] Given a table is SERVED, when I view its card, then it should have a teal appearance
- [ ] Given a table is READY_TO_PAY, when I view its card, then it should have an orange appearance
- [ ] Given a table is CLEANING, when I view its card, then it should have a yellow appearance
- [ ] Given an occupied table is shown, when I view it, then I should see: table number, status, guest count, time elapsed since seating

**Priority:** SHOULD
**Effort:** M
**Dependencies:** Table service, table-state.service.ts

---

### US-SALE-020: Start Table Session

**As a** Cashier
**I want to** start a new session for a table when customers are seated
**So that** I can begin taking orders for that table

**Acceptance Criteria:**

- [ ] Given I view a VACANT table, when I tap on it, then I should see a "Start Session" option
- [ ] Given I tap "Start Session", when the dialog opens, then I should enter the number of guests
- [ ] Given I enter the guest count and confirm, when the session starts, then the table status should change to SEATED
- [ ] Given a session is started, when I view the table, then I should see an option to "Take Order"
- [ ] Given I tap "Take Order", when the order panel opens, then items I add should be associated with this table session
- [ ] Given the table status changes, when other devices view the floor map, then they should see the updated status in real-time

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-019, Session service

---

### US-SALE-021: Join Multiple Tables

**As a** Cashier
**I want to** join multiple tables into a single session for large groups
**So that** I can manage orders and billing as one party across multiple tables

**Acceptance Criteria:**

- [ ] Given I view an occupied or vacant table, when I open the table context menu, then I should see a "Join Tables" option
- [ ] Given I tap "Join Tables", when the selection mode activates, then adjacent tables should be highlighted as joinable
- [ ] Given I am in join selection mode, when I tap a VACANT table, then it should be selected for joining
- [ ] Given I am in join selection mode, when I tap a table with an existing session from a different party, then it should NOT be selectable
- [ ] Given I have selected tables to join, when I tap "Confirm Join", then all selected tables should share a single session
- [ ] Given tables are joined, when I view any of them on the floor map, then they should display a linked indicator (e.g., chain icon)
- [ ] Given tables are joined, when I tap any of the joined tables, then I should see the combined order for all tables
- [ ] Given tables are joined, when payment is completed, then all joined tables should be released and marked as CLEANING
- [ ] Given I try to join more than 4 tables, when I select the 5th, then I should see a warning "Maximum 4 tables can be joined"

**Priority:** SHOULD
**Effort:** L
**Dependencies:** US-SALE-020

**Notes:**

- Maximum joinable tables should be configurable (default: 4)
- Joined tables share a single order session and bill

---

### US-SALE-022: Unjoin Tables (Owner/Admin Approval Required)

**As a** Cashier
**I want to** unjoin previously joined tables
**So that** I can separate tables when the group leaves or the situation changes

**Acceptance Criteria:**

- [ ] Given tables are joined and have NO active orders, when I tap "Unjoin Tables", then the tables should be unjoined immediately
- [ ] Given tables are joined and HAVE active orders, when I tap "Unjoin Tables", then I should see a message "Unjoin requires Owner/Admin approval - orders exist"
- [ ] Given Owner/Admin approval is required, when the Owner/Admin enters their PIN, then the tables should be unjoined
- [ ] Given tables are unjoined, when I view the floor map, then each table should appear as a separate entity
- [ ] Given tables with orders are unjoined, when I view each table, then all existing orders should remain associated with the PRIMARY table (first table in the join)
- [ ] Given I am a Cashier without Owner/Admin PIN, when I try to unjoin tables with orders, then I should see "Please ask an Owner/Admin to authorize this action"

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-021

---

### US-SALE-023: Mark Item as Takeaway from Table

**As a** Cashier
**I want to** mark individual items as "Takeaway" when ordering for a seated table
**So that** the kitchen can package those items separately for the customer to take home

**Acceptance Criteria:**

- [ ] Given I am adding items to a table order, when I add an item, then I should see a "Dine-in / Takeaway" toggle
- [ ] Given the toggle is visible, when I select "Takeaway", then that specific item should be flagged as isForTakeaway=true
- [ ] Given an item is marked as Takeaway, when I view the cart, then it should display a "Takeaway" badge next to the item
- [ ] Given takeaway items are in the order, when the order is sent to kitchen, then those items should display "TAKEAWAY" label on the KDS
- [ ] Given takeaway items exist, when I view the bill for the table, then takeaway items should be marked distinctly
- [ ] Given I have marked an item as Takeaway, when I tap the toggle again to "Dine-in", then the flag should be removed

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-020, KDS integration

**Notes:**

- Common use case: customer orders dessert to take home, or orders extra food for family

---

### US-SALE-024: Process Table Payment

**As a** Cashier
**I want to** process payment for a table session and close the table
**So that** I can complete the dining experience and prepare the table for the next guests

**Acceptance Criteria:**

- [ ] Given I am viewing an occupied table, when I tap "View Bill", then I should see the itemized bill for that table session
- [ ] Given I am viewing the bill, when I tap "Process Payment", then the payment panel should open with the table total
- [ ] Given payment is completed, when the process finishes, then the table session should close
- [ ] Given the session closes, when the table status updates, then it should change to CLEANING
- [ ] Given the table is CLEANING, when I view the floor map, then I should have an option to "Mark as Available"
- [ ] Given I tap "Mark as Available", when confirmed, then the table status should change to VACANT

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-019, US-SALE-020, Epic 2 (Payment Recording)

---

## Epic 5: Discounts & Member Points

Discounts enable applying percentage, fixed amount, or member point redemptions to orders, with approval workflows for large discounts.

### US-SALE-025: Apply Percentage Discount

**As a** Cashier
**I want to** apply a percentage discount to an order
**So that** I can honor promotions or handle customer service situations

**Acceptance Criteria:**

- [ ] Given I have items in the cart, when I tap "Discount", then a discount dialog should open
- [ ] Given the discount dialog is open, when I select "Percentage", then I should see a percentage input field
- [ ] Given I enter a percentage (e.g., 10%), when I view the preview, then I should see the calculated discount amount
- [ ] Given I enter a percentage, when I must enter a reason, then the reason field should be required
- [ ] Given the percentage is within my authorized limit, when I tap "Apply", then the discount should be applied immediately
- [ ] Given the percentage exceeds my authorized limit, when I tap "Apply", then the system should request Owner/Admin approval
- [ ] Given a discount is applied, when I view the cart, then I should see the discount amount subtracted from the total
- [ ] Given a discount is applied, when I view the cart, then I should see a "Remove Discount" option

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-005, discount.service.ts

---

### US-SALE-026: Apply Fixed Amount Discount

**As a** Cashier
**I want to** apply a fixed amount discount to an order
**So that** I can give specific dollar-value discounts (e.g., $5 off)

**Acceptance Criteria:**

- [ ] Given the discount dialog is open, when I select "Fixed Amount", then I should see an amount input field
- [ ] Given I enter an amount (e.g., $5.00), when I view the preview, then I should see "$5.00 discount"
- [ ] Given I enter an amount greater than the order total, when I try to apply, then I should see "Discount cannot exceed order total"
- [ ] Given I enter a valid amount and reason, when I tap "Apply", then the discount should be applied
- [ ] Given a fixed discount is applied, when I view the cart, then the discount should show as a line item deduction

**Priority:** SHOULD
**Effort:** S
**Dependencies:** US-SALE-025

---

### US-SALE-027: Look Up Member for Points Discount

**As a** Cashier
**I want to** look up a customer's member account to see their point balance
**So that** I can inform them of available points for redemption

**Acceptance Criteria:**

- [ ] Given the discount dialog is open, when I select "Member Points", then I should see a "Member ID" input field
- [ ] Given I enter a valid member ID (e.g., phone number or card number), when I tap "Look Up", then the member's name and point balance should display
- [ ] Given the member is found, when I view their info, then I should see: member name, current point balance, membership tier (if applicable)
- [ ] Given I enter an invalid member ID, when I tap "Look Up", then I should see "Member not found - please check the ID"
- [ ] Given a member is found with 0 points, when I view, then I should see "No points available for redemption"

**Priority:** SHOULD
**Effort:** M
**Dependencies:** Member/loyalty service integration

---

### US-SALE-028: Redeem Member Points for Discount

**As a** Cashier
**I want to** redeem a customer's member points for a discount
**So that** they can receive value from their accumulated loyalty points

**Acceptance Criteria:**

- [ ] Given a member is looked up with available points, when I tap "Redeem Points", then I should see a redemption calculator
- [ ] Given the redemption calculator is shown, when I view it, then I should see the conversion rate (e.g., "100 points = $1")
- [ ] Given I enter points to redeem (e.g., 500 points), when I view the preview, then I should see the discount value (e.g., "$5.00")
- [ ] Given I enter points exceeding the member's balance, when I try to confirm, then I should see "Insufficient points - member has [X] points"
- [ ] Given I enter points that result in a discount exceeding 50% of order, when I try to confirm, then I should see "Maximum redemption is 50% of order total"
- [ ] Given points are within limits, when I tap "Apply Redemption", then the discount should be applied to the order
- [ ] Given redemption is applied, when payment completes, then the redeemed points should be deducted from the member's account
- [ ] Given redemption is applied, when I view the bill, then it should show "Member Points Discount: -$X.XX (Y points redeemed)"

**Priority:** SHOULD
**Effort:** L
**Dependencies:** US-SALE-027

**Notes:**

- Redemption rate should be configurable in store settings
- Maximum redemption percentage should be configurable (default: 50%)

---

### US-SALE-029: Approve Large Point Redemptions (Owner/Admin)

**As an** Owner/Admin
**I want to** approve point redemptions above the configured threshold
**So that** I can prevent unauthorized large discounts

**Acceptance Criteria:**

- [ ] Given a Cashier attempts to redeem points above the threshold (e.g., > 1000 points), when they tap "Apply", then the system should require Owner/Admin PIN
- [ ] Given Owner/Admin PIN is required, when I enter my PIN, then the redemption should be validated
- [ ] Given I enter the correct PIN, when validation succeeds, then the redemption should be applied
- [ ] Given I enter an incorrect PIN, when validation fails, then I should see "Invalid PIN - redemption not authorized"
- [ ] Given a large redemption is approved, when I view the audit log, then I should see: member ID, points redeemed, approving admin, timestamp
- [ ] Given I am a Cashier attempting large redemption, when I don't have Owner/Admin PIN, then I should see "Please ask an Owner/Admin to authorize this redemption"

**Priority:** SHOULD
**Effort:** M
**Dependencies:** US-SALE-028

---

## Epic 6: Reports & Stats

Reports provide operational visibility with daily summaries and quick stats accessible from the Sales Page.

### US-SALE-030: View Daily Summary Stats

**As a** Cashier
**I want to** view today's sales summary without leaving the Sales Page
**So that** I can track how the day is going and answer basic questions about sales

**Acceptance Criteria:**

- [ ] Given I am on the Sales Page, when I tap "Stats" quick action or press Ctrl/Cmd + D, then the daily stats panel should open
- [ ] Given the stats panel is open, when I view it, then I should see today's date prominently displayed
- [ ] Given the stats panel is open, when I view total sales, then I should see the sum of all completed payments today
- [ ] Given the stats panel is open, when I view order count, then I should see the total number of orders completed today
- [ ] Given the stats panel is open, when I view average order value, then I should see total sales divided by order count
- [ ] Given the stats panel is open, when I view payment breakdown, then I should see: Cash (amount/%), Card (amount/%), Mobile (amount/%)
- [ ] Given the stats panel is open, when a new payment is completed, then the stats should update in real-time

**Priority:** SHOULD
**Effort:** M
**Dependencies:** Report service, useDashboardSocket

---

### US-SALE-031: View Top Selling Items

**As a** Cashier
**I want to** see the top selling items for today
**So that** I can recommend popular items to customers or identify what's selling well

**Acceptance Criteria:**

- [ ] Given the daily stats panel is open, when I scroll down, then I should see a "Top Items" section
- [ ] Given the Top Items section is visible, when I view it, then I should see the top 5 items by quantity sold
- [ ] Given top items are displayed, when I view each item, then I should see: item name, quantity sold, total revenue
- [ ] Given top items are displayed, when items update during the day, then the ranking should update in real-time

**Priority:** COULD
**Effort:** S
**Dependencies:** US-SALE-030

---

### US-SALE-032: Navigate to Full Reports (Owner/Admin)

**As an** Owner/Admin
**I want to** quickly access the full reports section from the stats panel
**So that** I can dive deeper into performance analysis when needed

**Acceptance Criteria:**

- [ ] Given I am an Owner/Admin viewing the stats panel, when I look at the bottom, then I should see a "View Full Report" button
- [ ] Given I am a Cashier viewing the stats panel, when I look at the bottom, then I should NOT see the "View Full Report" button (no access)
- [ ] Given I tap "View Full Report", when the navigation occurs, then I should be taken to the Reports page with today's date pre-selected
- [ ] Given I navigate to Reports, when I want to return to Sales, then I should be able to use the back button or navigation

**Priority:** COULD
**Effort:** S
**Dependencies:** US-SALE-030, Existing Reports module

---

## Summary Table

| Story ID    | Title                                         | Priority | Effort | Epic                      |
| ----------- | --------------------------------------------- | -------- | ------ | ------------------------- |
| US-SALE-001 | View Menu Items in Grid Layout                | MUST     | M      | Quick Sale                |
| US-SALE-002 | Filter Menu Items by Category                 | MUST     | S      | Quick Sale                |
| US-SALE-003 | Search Menu Items                             | MUST     | S      | Quick Sale                |
| US-SALE-004 | Add Item to Cart                              | MUST     | M      | Quick Sale                |
| US-SALE-005 | View and Manage Cart                          | MUST     | M      | Quick Sale                |
| US-SALE-006 | Clear Cart                                    | MUST     | S      | Quick Sale                |
| US-SALE-007 | Select Order Type                             | MUST     | S      | Quick Sale                |
| US-SALE-008 | Keyboard Shortcuts for Quick Sale             | SHOULD   | M      | Quick Sale                |
| US-SALE-009 | Open Payment Panel                            | MUST     | S      | Payment Recording         |
| US-SALE-010 | Record Cash Payment with Change Calculation   | MUST     | M      | Payment Recording         |
| US-SALE-011 | Record Card/Mobile Payment                    | MUST     | S      | Payment Recording         |
| US-SALE-012 | Record Other Payment Types                    | SHOULD   | S      | Payment Recording         |
| US-SALE-013 | Generate and Print Receipt                    | MUST     | M      | Payment Recording         |
| US-SALE-014 | View Active Orders Panel                      | MUST     | M      | Order Management          |
| US-SALE-015 | Receive Real-Time Order Updates               | MUST     | M      | Order Management          |
| US-SALE-016 | Search Orders                                 | MUST     | M      | Order Management          |
| US-SALE-017 | View Order Details                            | MUST     | S      | Order Management          |
| US-SALE-018 | Void Unpaid Order (Owner/Admin Only)          | SHOULD   | M      | Order Management          |
| US-SALE-019 | View Table Floor Map                          | SHOULD   | M      | Table Management          |
| US-SALE-020 | Start Table Session                           | SHOULD   | M      | Table Management          |
| US-SALE-021 | Join Multiple Tables                          | SHOULD   | L      | Table Management          |
| US-SALE-022 | Unjoin Tables (Owner/Admin Approval Required) | SHOULD   | M      | Table Management          |
| US-SALE-023 | Mark Item as Takeaway from Table              | SHOULD   | M      | Table Management          |
| US-SALE-024 | Process Table Payment                         | SHOULD   | M      | Table Management          |
| US-SALE-025 | Apply Percentage Discount                     | SHOULD   | M      | Discounts & Member Points |
| US-SALE-026 | Apply Fixed Amount Discount                   | SHOULD   | S      | Discounts & Member Points |
| US-SALE-027 | Look Up Member for Points Discount            | SHOULD   | M      | Discounts & Member Points |
| US-SALE-028 | Redeem Member Points for Discount             | SHOULD   | L      | Discounts & Member Points |
| US-SALE-029 | Approve Large Point Redemptions (Owner/Admin) | SHOULD   | M      | Discounts & Member Points |
| US-SALE-030 | View Daily Summary Stats                      | SHOULD   | M      | Reports & Stats           |
| US-SALE-031 | View Top Selling Items                        | COULD    | S      | Reports & Stats           |
| US-SALE-032 | Navigate to Full Reports (Owner/Admin)        | COULD    | S      | Reports & Stats           |

---

## Effort Summary by Phase

### Phase 1 (MVP) - MUST Have Stories

| Story       | Effort | Days            |
| ----------- | ------ | --------------- |
| US-SALE-001 | M      | 3-5             |
| US-SALE-002 | S      | 1-2             |
| US-SALE-003 | S      | 1-2             |
| US-SALE-004 | M      | 3-5             |
| US-SALE-005 | M      | 3-5             |
| US-SALE-006 | S      | 1-2             |
| US-SALE-007 | S      | 1-2             |
| US-SALE-009 | S      | 1-2             |
| US-SALE-010 | M      | 3-5             |
| US-SALE-011 | S      | 1-2             |
| US-SALE-013 | M      | 3-5             |
| US-SALE-014 | M      | 3-5             |
| US-SALE-015 | M      | 3-5             |
| US-SALE-016 | M      | 3-5             |
| US-SALE-017 | S      | 1-2             |
| **Total**   |        | **~25-40 days** |

**Estimated MVP Timeline:** 5-8 weeks (with 1 developer)

### Phase 2 - SHOULD Have Stories

| Story       | Effort | Days            |
| ----------- | ------ | --------------- |
| US-SALE-008 | M      | 3-5             |
| US-SALE-012 | S      | 1-2             |
| US-SALE-018 | M      | 3-5             |
| US-SALE-019 | M      | 3-5             |
| US-SALE-020 | M      | 3-5             |
| US-SALE-021 | L      | 5-10            |
| US-SALE-022 | M      | 3-5             |
| US-SALE-023 | M      | 3-5             |
| US-SALE-024 | M      | 3-5             |
| US-SALE-025 | M      | 3-5             |
| US-SALE-026 | S      | 1-2             |
| US-SALE-027 | M      | 3-5             |
| US-SALE-028 | L      | 5-10            |
| US-SALE-029 | M      | 3-5             |
| US-SALE-030 | M      | 3-5             |
| **Total**   |        | **~45-75 days** |

**Estimated Phase 2 Timeline:** 9-15 weeks (with 1 developer)

### Phase 3 - COULD Have Stories

| Story       | Effort | Days          |
| ----------- | ------ | ------------- |
| US-SALE-031 | S      | 1-2           |
| US-SALE-032 | S      | 1-2           |
| **Total**   |        | **~2-4 days** |

---

## Dependency Graph

```
US-SALE-001 (Menu Grid)
    └── US-SALE-002 (Category Filter)
    └── US-SALE-003 (Search)
    └── US-SALE-004 (Add to Cart)
            └── US-SALE-005 (View/Manage Cart)
                    └── US-SALE-006 (Clear Cart)
                    └── US-SALE-007 (Order Type)
                    └── US-SALE-009 (Payment Panel)
                            └── US-SALE-010 (Cash Payment)
                            └── US-SALE-011 (Card/Mobile Payment)
                            └── US-SALE-012 (Other Payment)
                            └── US-SALE-013 (Receipt)
                    └── US-SALE-025 (% Discount)
                            └── US-SALE-026 (Fixed Discount)
                    └── US-SALE-027 (Member Lookup)
                            └── US-SALE-028 (Point Redemption)
                                    └── US-SALE-029 (Approval)
    └── US-SALE-008 (Keyboard Shortcuts)

US-SALE-014 (Active Orders Panel)
    └── US-SALE-015 (Real-time Updates)

US-SALE-016 (Order Search)
    └── US-SALE-017 (Order Details)
            └── US-SALE-018 (Void Order)

US-SALE-019 (Table Floor Map)
    └── US-SALE-020 (Start Session)
            └── US-SALE-021 (Join Tables)
                    └── US-SALE-022 (Unjoin Tables)
            └── US-SALE-023 (Takeaway from Table)
            └── US-SALE-024 (Table Payment)

US-SALE-030 (Daily Stats)
    └── US-SALE-031 (Top Items)
    └── US-SALE-032 (Full Reports)
```

---

## Document History

| Version | Date       | Author                 | Changes                           |
| ------- | ---------- | ---------------------- | --------------------------------- |
| 1.0     | 2025-11-26 | Business Analyst Agent | Initial user stories based on BRD |
