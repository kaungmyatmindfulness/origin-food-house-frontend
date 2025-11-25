---
date: 2025-11-26
agent: business-analyst-product-owner
scope: full-stack
type: BRD
feature: Sales Page Enhancement
---

# Sales Page Business Requirements Analysis

## Executive Summary

This document provides a comprehensive Business Requirements Document (BRD) for enhancing the Sales Page in Origin Food House's Restaurant Management System (RMS). The current implementation is minimal - consisting only of a page header, a "Create Manual Order" button, and a placeholder for order history. This analysis identifies gaps, defines user personas, maps workflows, and prioritizes features using the MoSCoW method.

---

## 1. Current State Assessment

### 1.1 Existing Implementation

**Current Sales Page Location:** `apps/restaurant-management-system/src/app/[locale]/hub/sale/page.tsx`

**Current Features:**
- Page title and description
- "Create Manual Order" button that opens a dialog
- ManualOrderDialog supporting three session types: COUNTER, PHONE, TAKEOUT
- Empty placeholder for order history

**Current Limitations:**

| Gap | Impact | Priority |
|-----|--------|----------|
| No active orders panel | Staff cannot see orders in progress | Critical |
| No order history/search | Cannot look up past orders for refunds | Critical |
| No quick sale flow | Slow counter service, long queues | High |
| No table integration | Cannot see dine-in orders or seat walk-ins | High |
| No payment processing | Must navigate away to process payments | High |
| No daily summary stats | Manager lacks operational visibility | Medium |
| No quick actions bar | Repetitive navigation for common tasks | Medium |
| No receipt printing | Requires separate system for receipts | Medium |
| No offline mode | System unusable during internet outages | Low |

### 1.2 Existing System Capabilities

Based on codebase analysis, the following services already exist and should be leveraged:

**Order Management:**
- `order.service.ts` - Cart operations, checkout, order status updates
- `session.service.ts` - Manual session creation (COUNTER, PHONE, TAKEOUT, TABLE)
- `kitchen.service.ts` - KDS order queries and status updates

**Payment Processing:**
- `payment.service.ts` - Record payments, get order payments, create refunds
- `split-payment.service.ts` - Calculate splits (EVEN, BY_ITEM, CUSTOM), record split payments
- `discount.service.ts` - Apply discounts (PERCENTAGE, FIXED_AMOUNT), approval workflow

**Table Management:**
- `table.service.ts` - Get all tables, batch sync
- `table-state.service.ts` - Table status (VACANT, SEATED, ORDERING, SERVED, READY_TO_PAY, CLEANING)

**Real-time Updates:**
- Socket.IO integration for orders, kitchen, tables, and dashboard
- WebSocket hooks: `useOrderSocket`, `useKitchenSocket`, `useTableSocket`, `useDashboardSocket`

**Reporting:**
- `report.service.ts` - Sales summary, popular items, payment breakdown, order status reports

---

## 2. User Personas & Journeys

### 2.1 Primary User Personas

> **Note:** This system is designed for two primary personas with distinct permission levels.

#### Persona 1: Cashier (Standard User)

| Attribute | Details |
|-----------|---------|
| **Role** | Frontline staff handling all day-to-day operations |
| **Goals** | Process orders quickly, manage tables, handle payments accurately |
| **Pain Points** | Slow system response, too many clicks per transaction, difficulty finding menu items |
| **Needs** | Quick sale flow, numpad for cash handling, receipt printing, table management, order modification |
| **Technical Skill** | Basic to Moderate - needs intuitive, minimal-click interface |
| **Shift Pattern** | 8-12 hour shifts, high transaction volume during peak hours |
| **Permissions** | Create orders, manage tables, process payments, apply standard discounts, view daily stats |
| **Cannot Do** | Apply member point discounts beyond threshold, void orders, process refunds, modify system settings |

#### Persona 2: Owner/Admin (Privileged User)

| Attribute | Details |
|-----------|---------|
| **Role** | Restaurant owner or administrator with full system access |
| **Goals** | Monitor operations, handle exceptions, manage discounts, review performance |
| **Pain Points** | Lack of real-time visibility, needing to be physically present for approvals |
| **Needs** | Dashboard summary, audit trail, discount approval, void/refund authority, full reporting |
| **Technical Skill** | Variable - needs clear UI for administrative functions |
| **Access Pattern** | Full access at any time, receives notifications for approval requests |
| **Permissions** | All cashier permissions PLUS: approve large discounts, void orders, process refunds, manage member points, access all reports, modify settings |
| **Special Actions** | Manager override PIN for sensitive operations |

### 2.2 User Journey Maps

#### Journey 1: Quick Sale (Counter Service)

```
Customer                    Cashier                      System
   |                           |                            |
   |--[Approaches counter]---->|                            |
   |                           |--[Opens Sales Page]------->|
   |                           |                            |--[Shows quick sale panel]
   |                           |                            |
   |<--[Asks for order]--------|                            |
   |                           |                            |
   |--[Orders items]---------->|                            |
   |                           |--[Taps menu items]-------->|
   |                           |                            |--[Adds to cart instantly]
   |                           |                            |
   |                           |--[Reviews cart]----------->|
   |                           |                            |--[Shows total]
   |<--[States total]----------|                            |
   |                           |                            |
   |--[Pays cash]------------->|                            |
   |                           |--[Enters tendered]-------->|
   |                           |                            |--[Calculates change]
   |                           |--[Completes payment]------>|
   |                           |                            |--[Prints receipt]
   |<--[Returns change]--------|                            |--[Sends to kitchen]
   |                           |                            |
```

**Pain Points to Solve:**
- Menu item search should be instant (search-as-you-type)
- Cart should update without page refresh
- Payment should be in same flow (no navigation)
- Receipt should print automatically

#### Journey 2: Table-Based Ordering (Dine-In)

```
Customer                    Cashier                      System
   |                           |                            |
   |--[Enters restaurant]----->|                            |
   |                           |--[Checks table status]---->|
   |                           |                            |--[Shows available tables]
   |                           |--[Seats customer]--------->|
   |                           |                            |--[Updates table: SEATED]
   |                           |                            |
   |--[Reviews menu]---------->|                            |
   |                           |                            |
   |--[Places order]---------->|                            |
   |                           |--[Selects table]---------->|
   |                           |                            |--[Opens table session]
   |                           |--[Adds items to order]---->|
   |                           |                            |--[Confirms order]
   |                           |                            |--[Sends to KDS]
   |                           |                            |--[Updates table: ORDERING]
   |                           |                            |
   |                           |<--[Notified: Order Ready]--|
   |<--[Serves food]-----------|                            |
   |                           |                            |--[Updates table: SERVED]
   |                           |                            |
   |--[Requests bill]--------->|                            |
   |                           |--[Opens bill]------------->|
   |                           |                            |--[Shows itemized bill]
   |                           |                            |
   |--[Pays]------------------>|                            |
   |                           |--[Records payment]-------->|
   |                           |                            |--[Closes session]
   |                           |                            |--[Updates table: CLEANING]
   |<--[Returns receipt]-------|                            |
```

**Pain Points to Solve:**
- Table status should update in real-time
- Order-to-table association should be seamless
- Cashier should be notified when order is ready
- Bill presentation should be quick

#### Journey 2a: Takeaway Order from Table (Dine-In + Takeaway)

> **New Feature:** Customers seated at a table can order additional items as takeaway.

```
Customer                    Cashier                      System
   |                           |                            |
   |--[At table, requests]---->|                            |
   |   "I want this to go"     |                            |
   |                           |--[Opens table session]---->|
   |                           |                            |--[Shows existing order]
   |                           |--[Adds item as TAKEAWAY]-->|
   |                           |                            |--[Marks item: isForTakeaway=true]
   |                           |                            |--[Sends to kitchen with label]
   |                           |                            |
   |                           |<--[Kitchen packs separately]|
   |                           |                            |
   |--[Requests bill]--------->|                            |
   |                           |--[Opens bill]------------->|
   |                           |                            |--[Shows all items]
   |                           |                            |--[Takeaway items marked]
   |                           |                            |
   |--[Pays for all]---------->|                            |
   |                           |--[Records payment]-------->|
   |<--[Receives dine-in food]-|                            |
   |<--[Receives takeaway pkg]-|                            |
```

**Use Cases:**
- Customer orders dessert to take home
- Customer orders for family members at home
- Leftover packaging requested during meal

#### Journey 2b: Join Tables

> **New Feature:** Merge multiple tables into one session for large groups.

```
Customer Group              Cashier                      System
   |                           |                            |
   |--[Large group arrives]--->|                            |
   |   "We need 2 tables"      |                            |
   |                           |--[Selects Table 5]-------->|
   |                           |                            |--[Opens table context menu]
   |                           |--[Click "Join Tables"]---->|
   |                           |                            |--[Shows adjacent tables]
   |                           |--[Selects Table 6]-------->|
   |                           |                            |--[Creates merged session]
   |                           |                            |--[Tables 5+6 linked]
   |                           |                            |--[Single order session]
   |                           |                            |
   |--[Orders from any table]->|                            |
   |                           |--[Adds to merged session]->|
   |                           |                            |--[Both tables show same order]
   |                           |                            |
   |--[Requests bill]--------->|                            |
   |                           |--[Opens combined bill]---->|
   |                           |                            |--[Shows all items from both]
   |                           |                            |
   |--[Pays (or splits)]------>|                            |
   |                           |--[Records payment]-------->|
   |                           |                            |--[Releases both tables]
   |                           |                            |--[Both marked: CLEANING]
```

**Join Table Rules:**
- Only VACANT or same-party tables can be joined
- Joined tables share a single order session
- Bill shows combined items
- Splitting can be done at checkout (by person, not by table)
- Unjoin requires manager approval if orders exist

#### Journey 3: Bill Splitting Flow

```
Customer(s)                 Server                       System
   |                           |                            |
   |--[Requests to split]----->|                            |
   |                           |--[Opens split dialog]----->|
   |                           |                            |--[Shows split options]
   |                           |                            |
   |--[Wants even split]------>|                            |
   |                           |--[Selects EVEN, 3 ways]--->|
   |                           |                            |--[Calculates: Total/3]
   |                           |                            |--[Shows individual amounts]
   |                           |                            |
   |--[Guest 1 pays card]----->|                            |
   |                           |--[Records payment G1]----->|
   |                           |                            |--[Updates remaining]
   |                           |                            |
   |--[Guest 2 pays cash]----->|                            |
   |                           |--[Records payment G2]----->|
   |                           |                            |--[Updates remaining]
   |                           |                            |
   |--[Guest 3 pays mobile]--->|                            |
   |                           |--[Records payment G3]----->|
   |                           |                            |--[Marks PAID_IN_FULL]
   |<--[Prints receipts]-------|                            |--[Generates 3 receipts]
```

#### Journey 4: Discount Application Flow

**4a. Standard Discount (Percentage/Fixed)**

```
Customer                    Cashier                      Owner/Admin                 System
   |                           |                            |                           |
   |--[Requests discount]----->|                            |                           |
   |                           |--[Opens discount dialog]-->|                           |
   |                           |                            |                           |--[Shows discount form]
   |                           |--[Enters 10%, reason]----->|                           |
   |                           |                            |                           |--[Creates PENDING discount]
   |                           |                            |<--[Notification]----------|
   |                           |                            |--[Reviews request]------->|
   |                           |                            |                           |--[Shows discount details]
   |                           |                            |--[Approves]-------------->|
   |                           |                            |                           |--[Updates: APPROVED]
   |                           |<--[Discount applied]-------|                           |
   |                           |                            |                           |--[Recalculates total]
   |<--[New total stated]------|                            |                           |
```

**4b. Member Points Discount (New)**

> **New Feature:** Customers can redeem accumulated member points for discounts.

```
Customer                    Cashier                      System
   |                           |                            |
   |--[Shows member card/ID]-->|                            |
   |                           |--[Enters member ID]------->|
   |                           |                            |--[Looks up member]
   |                           |                            |--[Shows: Name, Points Balance]
   |                           |                            |
   |--[Wants to use points]--->|                            |
   |                           |--[Opens point redemption]->|
   |                           |                            |--[Shows redemption options]
   |                           |                            |--[e.g., 100pts = $1 off]
   |                           |                            |
   |                           |--[Enters points to use]--->|
   |                           |                            |--[Validates: enough points?]
   |                           |                            |--[Calculates discount value]
   |                           |                            |
   |                           |  IF points > threshold:    |
   |                           |                            |--[Requires Owner/Admin PIN]
   |                           |--[Owner enters PIN]------->|
   |                           |                            |--[Validates authorization]
   |                           |                            |
   |                           |                            |--[Applies discount]
   |                           |                            |--[Deducts points from member]
   |                           |                            |--[Logs redemption]
   |<--[New total stated]------|                            |
```

**Member Points Rules:**
| Rule | Description |
|------|-------------|
| **Redemption Rate** | Configurable (e.g., 100 points = $1) |
| **Minimum Redemption** | Configurable minimum points to redeem |
| **Maximum per Transaction** | Configurable cap (e.g., max 50% of order) |
| **Threshold for Approval** | Points above X require Owner/Admin PIN |
| **Points Earning** | Configurable (e.g., $1 spent = 1 point) - applied after payment |

#### Journey 5: Refund/Void Flow

```
Customer                    Cashier                      Manager                     System
   |                           |                            |                           |
   |--[Requests refund]------->|                            |                           |
   |                           |--[Searches order]--------->|                           |
   |                           |                            |                           |--[Shows order details]
   |                           |--[Initiates refund]------->|                           |
   |                           |                            |                           |--[Requires manager auth]
   |                           |                            |--[Authenticates]--------->|
   |                           |                            |                           |--[Validates permission]
   |                           |--[Enters reason]---------->|                           |
   |                           |                            |                           |--[Creates refund record]
   |                           |                            |                           |--[Updates order: REFUNDED]
   |<--[Processes refund]------|                            |                           |--[Logs to audit trail]
```

---

## 3. Recommended User Flows

### 3.1 Quick Sale Flow (Primary Flow)

**Entry Points:**
1. Sales Page loads (default view)
2. Keyboard shortcut: `Ctrl/Cmd + N` (New Quick Sale)

**Flow Steps:**

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Staff opens Sales Page | Show Quick Sale panel with menu grid |
| 2 | Staff taps category | Filter menu items by category |
| 3 | Staff taps menu item | Add to cart, show running total |
| 4 | Staff taps item in cart | Open quantity/modification dialog |
| 5 | Staff reviews cart | Show subtotal, tax, service charge, total |
| 6 | Staff taps "Pay" | Open payment panel (same page) |
| 7 | Staff selects payment method | Show relevant input (cash: numpad, card: transaction ID) |
| 8 | Staff completes payment | Print receipt, send to kitchen, clear cart |

**Quick Sale Panel Layout:**

```
+------------------------------------------------------------------+
|  QUICK SALE                                    [Search: _______] |
+------------------------------------------------------------------+
|                                                                   |
|  CATEGORIES (horizontal scroll)                                   |
|  [All] [Appetizers] [Main Course] [Drinks] [Desserts] [Sides]     |
|                                                                   |
+-----------------------------------+-------------------------------+
|                                   |                               |
|  MENU ITEMS (grid)                |  CART                         |
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|  | Item  | | Item  | | Item  |    |  | Pad Thai        x1   $12 ||
|  | $12   | | $15   | | $8    |    |  | Green Curry     x2   $30 ||
|  +-------+ +-------+ +-------+    |  | Thai Iced Tea   x1   $5  ||
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|  | Item  | | Item  | | Item  |    |  Subtotal:              $47  |
|  | $10   | | $14   | | $9    |    |  VAT (7%):              $3.29|
|  +-------+ +-------+ +-------+    |  Service (10%):         $4.70|
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|  | Item  | | Item  | | Item  |    |  TOTAL:               $54.99 |
|  | $11   | | $13   | | $7    |    |  +---------------------------+|
|  +-------+ +-------+ +-------+    |                               |
|                                   |  [Clear Cart]  [Apply Discount]|
|                                   |                               |
|                                   |  +---------------------------+|
|                                   |  |      PAY $54.99           ||
|                                   |  +---------------------------+|
+-----------------------------------+-------------------------------+
```

### 3.2 Table-Based Ordering Flow

**Entry Point:** Sales Page > Tables tab or quick action

**Flow:**

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Cashier clicks "Tables" tab | Show floor map with table status |
| 2 | Cashier clicks vacant table | Show "Start Session" dialog |
| 3 | Cashier enters guest count | Create table session |
| 4 | Cashier adds items | Associate items with table session |
| 5 | (Optional) Mark item as "Takeaway" | Flag item for separate packaging |
| 6 | Cashier confirms order | Send to kitchen, update table status |
| 7 | Kitchen marks ready | Notify cashier (toast + sound) |
| 8 | Cashier marks served | Update table status to SERVED |
| 9 | Customer requests bill | Open bill view for table |
| 10 | Record payment | Close session, mark table CLEANING |

**Additional Table Features:**

#### Join Tables

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Cashier selects first table | Show table context menu |
| 2 | Click "Join Tables" | Highlight joinable tables (VACANT or same session) |
| 3 | Select tables to join | Create merged session |
| 4 | Confirm join | All joined tables share single order/bill |

**Join Table Rules:**
- Maximum tables to join: Configurable (default: 4)
- Can only join VACANT tables or tables with same party
- Joined tables display linked indicator on floor map
- Unjoin requires Owner/Admin approval if active orders exist
- When closed, all joined tables marked CLEANING

#### Takeaway from Table

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Adding item to table order | Show "Dine-in / Takeaway" toggle |
| 2 | Select "Takeaway" | Mark item with takeaway flag |
| 3 | Confirm order | Kitchen sees "TAKEAWAY" label on item |
| 4 | Kitchen prepares | Pack takeaway items separately |
| 5 | Bill generated | Shows all items, takeaway items marked |

### 3.3 Takeaway/Delivery Order Flow

**Entry Points:**
1. Quick Sale > Select "Takeaway" type
2. Phone order button
3. Keyboard shortcut: `Ctrl/Cmd + T`

**Flow:**

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Staff clicks "New Takeaway" | Open order form with customer fields |
| 2 | Enter customer name/phone | Save for order tracking |
| 3 | Add items to order | Same menu selection as quick sale |
| 4 | Set pickup/delivery time | Optional field for scheduling |
| 5 | Confirm order | Generate order number, send to kitchen |
| 6 | Process prepayment (optional) | Record partial/full payment |
| 7 | Kitchen marks ready | Show in "Ready for Pickup" queue |
| 8 | Customer arrives | Retrieve order by name/number |
| 9 | Complete payment | Hand over order, close |

### 3.4 Bill Splitting Flow

**Entry Point:** Order details > Split Bill button

**Supported Split Types:**
1. **EVEN** - Divide total equally among N guests
2. **BY_ITEM** - Assign specific items to each guest
3. **CUSTOM** - Enter custom amounts per guest

**Flow (Even Split):**

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Staff clicks "Split Bill" | Open split dialog |
| 2 | Select "Even Split" | Show guest count input |
| 3 | Enter number of guests (e.g., 3) | Calculate amount per person |
| 4 | System shows breakdown | Total $90 / 3 = $30 each |
| 5 | Process Guest 1 payment | Record, show remaining: 2 guests |
| 6 | Process Guest 2 payment | Record, show remaining: 1 guest |
| 7 | Process Guest 3 payment | Record, mark PAID_IN_FULL |
| 8 | Print receipts | Generate individual receipts |

### 3.5 Discount Application Flow

**Entry Point:** Cart/Order > Apply Discount

**Supported Discount Types:**
1. **PERCENTAGE** - e.g., 10% off total
2. **FIXED_AMOUNT** - e.g., $5 off
3. **MEMBER_POINTS** - Redeem loyalty points for discount value

**Approval Workflow:**
- Cashier creates discount request with reason
- If discount > threshold (configurable), requires Owner/Admin approval
- Owner/Admin can approve/reject from notification or dashboard
- Approved discounts auto-apply to order

**Member Points Flow:**
| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Cashier scans/enters member ID | Show member name and point balance |
| 2 | Select "Redeem Points" | Show redemption calculator |
| 3 | Enter points to redeem | Calculate discount (e.g., 100pts = $1) |
| 4 | Confirm redemption | Apply discount if within threshold |
| 5 | IF above threshold | Require Owner/Admin PIN |
| 6 | Complete | Deduct points, apply discount, log transaction |

### 3.6 Refund/Void Flow

**Entry Points:**
1. Order search > Select order > Refund
2. Recent orders > Refund button

**Void vs. Refund:**
- **Void:** Cancel unpaid order (no money exchanged)
- **Refund:** Return money for paid order

**Flow:**

| Step | Action | System Response |
|------|--------|-----------------|
| 1 | Search for order | Show order details |
| 2 | Click "Refund" or "Void" | Show confirmation with reason field |
| 3 | Enter reason (required) | Validate reason provided |
| 4 | Owner/Admin authentication | Verify Owner/Admin PIN (required) |
| 5 | Confirm action | Process refund/void |
| 6 | Generate documentation | Print refund slip, update audit log |

> **Note:** Refund/Void actions are Owner/Admin ONLY. Cashiers cannot perform these operations.

### 3.7 Payment Processing Flow (Record-Only)

> **IMPORTANT:** Payment processing is for **RECORD KEEPING ONLY** - no actual payment gateway integration.

**Payment Methods Supported:**

| Method | UI Behavior | Notes |
|--------|-------------|-------|
| **Cash** | Show numpad for amount tendered, auto-calculate change | Must validate tendered >= total |
| **Card** | Optional: Enter last 4 digits or transaction reference | For record/reconciliation only |
| **Mobile/E-Wallet** | Optional: Enter reference number | For record/reconciliation only |
| **Other** | Free-text note field | Flexible for gift cards, vouchers, etc. |

**Cash Payment Flow (Detailed):**

```
+-------------------------------+
|  PAYMENT - CASH               |
|  Order Total: $45.63          |
+-------------------------------+
|                               |
|  Amount Tendered:             |
|  +---------------------------+|
|  |           $50.00          ||
|  +---------------------------+|
|                               |
|  Quick Amounts:               |
|  [$50] [$100] [$200] [Exact]  |
|                               |
|  Numpad:                      |
|  [7] [8] [9]                  |
|  [4] [5] [6]                  |
|  [1] [2] [3]                  |
|  [C] [0] [.]                  |
|                               |
|  +---------------------------+|
|  |  CHANGE DUE:     $4.37    ||
|  +---------------------------+|
|                               |
|  [Cancel]  [Complete Payment] |
+-------------------------------+
```

**Change Calculation Rules:**
- Change = Amount Tendered - Order Total
- If tendered < total: Show error "Insufficient amount"
- If tendered = total (Exact): Change = $0.00
- Round change to nearest cent

**Payment Recording:**
| Field | Required | Description |
|-------|----------|-------------|
| `paymentMethod` | Yes | CASH, CARD, MOBILE, OTHER |
| `amountPaid` | Yes | Total amount recorded |
| `amountTendered` | Cash only | What customer handed over |
| `changeGiven` | Cash only | Auto-calculated change |
| `referenceNumber` | Optional | Card/mobile transaction ref |
| `notes` | Optional | Free-text for special cases |

---

## 4. Information Architecture

### 4.1 Proposed Page Sections

The Sales Page should be organized into the following logical sections:

```
+------------------------------------------------------------------+
|  SALES PAGE                                                       |
+------------------------------------------------------------------+
|                                                                   |
|  [Quick Actions Bar]                                              |
|  [New Order] [Tables] [Pickup Queue] [Search Order] [Daily Stats] |
|                                                                   |
+-----------------------------------+-------------------------------+
|                                   |                               |
|  [Main Content Area]              |  [Side Panel]                 |
|                                   |                               |
|  - Quick Sale (default)           |  - Active Cart                |
|  - Tables View                    |  - OR: Order Details          |
|  - Pickup Queue                   |  - OR: Daily Summary          |
|  - Order Search                   |                               |
|                                   |                               |
+-----------------------------------+-------------------------------+
|                                                                   |
|  [Active Orders Bar (collapsible)]                                |
|  Shows: Preparing orders, Ready orders, Pending payments          |
|                                                                   |
+------------------------------------------------------------------+
```

### 4.2 Section Details

#### 4.2.1 Quick Actions Bar

| Action | Icon | Shortcut | Description |
|--------|------|----------|-------------|
| New Order | Plus | Ctrl+N | Start new quick sale |
| Tables | Grid | Ctrl+T | View/manage tables |
| Pickup Queue | Package | Ctrl+P | View ready-for-pickup orders |
| Search Order | Search | Ctrl+F | Find order by number/customer |
| Daily Stats | Chart | Ctrl+D | Toggle daily summary panel |

#### 4.2.2 Active Orders Panel

Displays real-time order status in three lanes:

| Lane | Orders Shown | Visual Indicator |
|------|--------------|------------------|
| **Preparing** | Orders in kitchen (PENDING, PREPARING) | Yellow badge |
| **Ready** | Orders ready for serving/pickup (READY) | Green badge with pulse |
| **Awaiting Payment** | Served but unpaid orders | Orange badge |

**Per-Order Display:**
- Order number/table name
- Time elapsed since order
- Item count
- Status badge
- Quick action buttons (View, Pay, Cancel)

#### 4.2.3 Menu Grid (Quick Sale View)

**Components:**
- Category filter bar (horizontal scroll)
- Search input with instant results
- Menu item cards in responsive grid
- Quantity controls on cards
- Out-of-stock indicators

**Menu Item Card:**
```
+-------------------+
|  [Image]          |
|  Item Name        |
|  $12.99           |
|  [+ Add to Cart]  |
+-------------------+
```

#### 4.2.4 Cart Panel

**Always-visible sidebar showing:**
- Current cart items with quantities
- Per-item price and customizations
- Remove/modify item buttons
- Subtotal, tax, service charge breakdown
- Discount display (if applied)
- Grand total (prominent)
- Payment button
- Secondary actions: Clear, Discount, Split

#### 4.2.5 Tables View

**Floor Map Display:**
- Visual grid of tables with status colors
- Guest count per occupied table
- Time elapsed since seating
- Click to view/manage table session

**Table Card:**
```
+-------------------+
|  Table 5          |
|  [SEATED]         |
|  4 guests         |
|  45 min           |
+-------------------+
```

#### 4.2.6 Pickup Queue View

**For takeaway/phone orders:**
- Queue number
- Customer name
- Order ready time
- Order total
- Pickup status (Waiting, Called, Picked Up)
- Quick actions: Call customer, Mark picked up

#### 4.2.7 Daily Summary Stats

**Dashboard cards showing:**
- Total sales today
- Order count
- Average order value
- Payment breakdown (Cash/Card/Mobile)
- Top selling items
- Comparison to yesterday/last week (optional)

---

## 5. Feature Prioritization (MoSCoW)

### 5.1 MUST Have (MVP - Phase 1)

These features are essential for basic Sales Page functionality:

| ID | Feature | Justification | Effort |
|----|---------|---------------|--------|
| M1 | Quick Sale menu grid | Core ordering functionality | High |
| M2 | Cart panel with real-time updates | Essential for order building | Medium |
| M3 | Basic payment flow (Cash, Card) | Cannot complete transactions without | High |
| M4 | Active orders panel | Staff need visibility of pending work | Medium |
| M5 | Order search | Required for refunds and lookups | Medium |
| M6 | Receipt generation | Customers expect receipts | Medium |
| M7 | Integration with existing KDS | Orders must flow to kitchen | Low |
| M8 | Socket.IO real-time updates | Leverage existing infrastructure | Low |

**Estimated MVP Timeline:** 3-4 weeks

### 5.2 SHOULD Have (Phase 2)

Important features that significantly improve usability:

| ID | Feature | Justification | Effort |
|----|---------|---------------|--------|
| S1 | Tables view integration | Many restaurants need table management | High |
| S2 | **Join Tables** | Large groups need multiple tables as one session | Medium |
| S3 | **Takeaway from Table** | Customers want to order items to-go while dining | Low |
| S4 | Bill splitting (EVEN, CUSTOM) | Common customer request | Medium |
| S5 | Discount application (%, fixed) | Sales promotions, complaint handling | Medium |
| S6 | **Member Points Discount** | Loyalty program integration | Medium |
| S7 | Daily summary stats | Owner/Admin needs visibility | Medium |
| S8 | Takeaway queue view | Essential for takeaway-heavy operations | Medium |
| S9 | Keyboard shortcuts | Power user efficiency | Low |
| S10 | Audio notifications | Alert for ready orders | Low |
| S11 | Order modification | Correct mistakes before kitchen | Medium |

**Estimated Phase 2 Timeline:** 5-6 weeks after MVP

### 5.3 COULD Have (Phase 3)

Desirable features that enhance experience:

| ID | Feature | Justification | Effort |
|----|---------|---------------|--------|
| C1 | Bill splitting by item | Restaurant preference | Medium |
| C2 | Refund workflow (Owner/Admin) | Handle returns systematically | Medium |
| C3 | Void workflow (Owner/Admin) | Cancel unpaid orders | Low |
| C4 | Points earning on payment | Award points after successful payment | Medium |
| C5 | Order history export | Reporting needs | Low |
| C6 | Customizable menu grid layout | Restaurant preference | Medium |
| C7 | Multi-currency support | International customers | High |

### 5.4 WON'T Have (Out of Scope - Future)

Features explicitly deferred:

| ID | Feature | Reason |
|----|---------|--------|
| W1 | Payment gateway integration | Record-only by design (uses external terminals) |
| W2 | Offline mode | Requires significant architecture change |
| W3 | Delivery management | Separate module recommended |
| W4 | Inventory integration | Backend not ready |
| W5 | Kitchen display on Sales Page | KDS is separate module |
| W6 | Customer-facing display | Hardware dependency |
| W7 | Barcode scanning | Hardware dependency |

---

## 6. Wireframe Descriptions

### 6.1 Sales Page - Default View (Quick Sale)

```
+------------------------------------------------------------------+
|  HEADER                                           [User] [Lang]   |
+------------------------------------------------------------------+
|                                                                   |
|  SALES                                                            |
|  Create and manage orders for your restaurant                     |
|                                                                   |
|  +---------------------------------------------------------------+|
|  | QUICK ACTIONS                                                  ||
|  | [+ New Order] [Tables] [Pickup] [Search] [Stats]              ||
|  +---------------------------------------------------------------+|
|                                                                   |
+-----------------------------------+-------------------------------+
|                                   |                               |
|  MENU                             |  CURRENT ORDER                |
|                                   |                               |
|  [Search items...        ] [x]    |  Order Type: [Counter v]      |
|                                   |  Customer: Walk-in            |
|  Categories:                      |                               |
|  [All][Appetizers][Mains][Drinks] |  +---------------------------+|
|                                   |  | Pad Thai        x2   $24 ||
|  +-------+ +-------+ +-------+    |  | [+][-] Edit  Remove       ||
|  |       | |       | |       |    |  +---------------------------+|
|  | Pad   | | Green | | Som   |    |  | Green Curry     x1   $15 ||
|  | Thai  | | Curry | | Tam   |    |  | [+][-] Edit  Remove       ||
|  | $12   | | $15   | | $8    |    |  +---------------------------+|
|  | [Add] | | [Add] | | [Add] |    |                               |
|  +-------+ +-------+ +-------+    |  Subtotal:              $39.00|
|                                   |  VAT (7%):              $2.73 |
|  +-------+ +-------+ +-------+    |  Service (10%):         $3.90 |
|  |       | |       | |       |    |  ---------------------------- |
|  | Thai  | | Mango | | Fried |    |  TOTAL:               $45.63 |
|  | Tea   | | Rice  | | Rice  |    |                               |
|  | $5    | | $10   | | $4    |    |  [Clear] [Discount] [Split]   |
|  | [Add] | | [Add] | | [Add] |    |                               |
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|                                   |  |      PAY $45.63           ||
|  [Load more...]                   |  +---------------------------+|
|                                   |                               |
+-----------------------------------+-------------------------------+
|                                                                   |
|  ACTIVE ORDERS                                       [Collapse ^] |
|  +---------------+ +---------------+ +---------------+            |
|  | #1234         | | #1235         | | #1236         |            |
|  | Table 3       | | Takeaway      | | Counter       |            |
|  | PREPARING     | | READY         | | PENDING PAY   |            |
|  | 12 min        | | 2 min         | | 5 min         |            |
|  | [View] [Pay]  | | [View] [Done] | | [View] [Pay]  |            |
|  +---------------+ +---------------+ +---------------+            |
|                                                                   |
+------------------------------------------------------------------+
```

### 6.2 Sales Page - Tables View

```
+------------------------------------------------------------------+
|  HEADER                                           [User] [Lang]   |
+------------------------------------------------------------------+
|                                                                   |
|  TABLES                                      Filter: [All v]      |
|  Manage table sessions and orders                                 |
|                                                                   |
|  +---------------------------------------------------------------+|
|  | QUICK ACTIONS                                                  ||
|  | [+ New Order] [Tables*] [Pickup] [Search] [Stats]             ||
|  +---------------------------------------------------------------+|
|                                                                   |
+-----------------------------------+-------------------------------+
|                                   |                               |
|  FLOOR MAP                        |  TABLE DETAILS                |
|                                   |                               |
|  +-------+ +-------+ +-------+    |  Table 5                      |
|  |       | |       | |       |    |  Status: SEATED               |
|  | T1    | | T2    | | T3    |    |  Guests: 4                    |
|  |VACANT | |SEATED | |SERVED |    |  Time: 45 minutes             |
|  |       | | 2g    | | 4g    |    |  Server: John                 |
|  +-------+ +-------+ +-------+    |                               |
|                                   |  Current Orders:              |
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|  |       | |       | |       |    |  | Order #1240               ||
|  | T4    | | T5    | | T6    |    |  | 3 items - $47.50          ||
|  |VACANT | |SEATED*| |READY  |    |  | Status: PREPARING         ||
|  |       | | 4g    | | 2g    |    |  | [View] [Add Items]        ||
|  +-------+ +-------+ +-------+    |  +---------------------------+|
|                                   |                               |
|  +-------+ +-------+ +-------+    |  Actions:                     |
|  |       | |       | |       |    |  [+ New Order for Table]      |
|  | T7    | | T8    | | T9    |    |  [View Bill]                  |
|  |CLEAN  | |VACANT | |PAYING |    |  [Process Payment]            |
|  |       | |       | | 3g    |    |  [Change Status]              |
|  +-------+ +-------+ +-------+    |  [Close Table]                |
|                                   |                               |
|  Legend: VACANT SEATED ORDERING   |                               |
|          SERVED READY_TO_PAY CLEAN|                               |
|                                   |                               |
+-----------------------------------+-------------------------------+
```

### 6.3 Payment Panel (Inline)

```
+-------------------------------+
|  PAYMENT                      |
|  Order #1234 - $45.63         |
+-------------------------------+
|                               |
|  Payment Method:              |
|  [CASH] [CARD] [MOBILE]       |
|                               |
|  +---------------------------+|
|  | Amount Due:    $45.63     ||
|  | Amount Paid:   $0.00      ||
|  | Remaining:     $45.63     ||
|  +---------------------------+|
|                               |
|  --- CASH PAYMENT ---         |
|                               |
|  Amount Tendered:             |
|  +---------------------------+|
|  |           $50.00          ||
|  +---------------------------+|
|                               |
|  Quick Amounts:               |
|  [$50] [$100] [$200] [$500]   |
|                               |
|  +---------------------------+|
|  |  CHANGE:        $4.37     ||
|  +---------------------------+|
|                               |
|  [Cancel]  [Complete Payment] |
|                               |
+-------------------------------+
```

### 6.4 Daily Stats Panel

```
+-------------------------------+
|  TODAY'S SUMMARY              |
|  November 26, 2025            |
+-------------------------------+
|                               |
|  +---------------------------+|
|  | Total Sales               ||
|  | $2,450.00                 ||
|  | +12% vs yesterday         ||
|  +---------------------------+|
|                               |
|  +---------------------------+|
|  | Orders                    ||
|  | 47 orders                 ||
|  | Avg: $52.13               ||
|  +---------------------------+|
|                               |
|  +---------------------------+|
|  | Payment Breakdown         ||
|  | Cash:   $1,200 (49%)      ||
|  | Card:   $950  (39%)       ||
|  | Mobile: $300  (12%)       ||
|  +---------------------------+|
|                               |
|  +---------------------------+|
|  | Top Items                 ||
|  | 1. Pad Thai (23 sold)     ||
|  | 2. Green Curry (18 sold)  ||
|  | 3. Thai Tea (31 sold)     ||
|  +---------------------------+|
|                               |
|  [View Full Report]           |
|                               |
+-------------------------------+
```

---

## 7. Integration Points

### 7.1 Kitchen Display System (KDS)

**Integration Type:** Real-time bidirectional

**Sales Page -> KDS:**
- New order placed -> `order:created` WebSocket event
- Order items added -> `order:updated` event
- Order cancelled -> `order:cancelled` event

**KDS -> Sales Page:**
- Order status change -> Update active orders panel
- Order ready -> Audio notification + visual indicator

**Implementation:**
- Leverage existing `useKitchenSocket` hook
- Subscribe to `/kitchen` namespace
- Listen for `orderStatusChanged` events

### 7.2 Table Management

**Integration Type:** Real-time bidirectional

**Sales Page -> Tables:**
- Start table session -> Update table status to SEATED
- Place order -> Update table status to ORDERING
- Complete payment -> Update table status to CLEANING

**Tables -> Sales Page:**
- Table status change -> Update floor map
- Session ended externally -> Refresh table list

**Implementation:**
- Leverage existing `useTableSocket` hook
- Subscribe to `/table` namespace
- Sync with `table-state.service.ts`

### 7.3 Payment Processing (Record-Only)

**Integration Type:** Direct API calls (NO payment gateway integration)

> **IMPORTANT:** This is a record-keeping system only. Actual payment processing happens outside the system (physical card terminals, cash registers, etc.). The POS simply records what payment method was used.

**Services to Use:**
- `payment.service.ts` for recording standard payments
- `split-payment.service.ts` for recording split payments
- `discount.service.ts` for discount handling

**Flow:**
1. Cashier selects payment method (Cash, Card, Mobile, Other)
2. **For Cash:** Enter amount tendered → System calculates change
3. **For Card/Mobile:** Optionally enter reference number
4. Call `recordPayment()` or `recordSplitPayment()`
5. Handle success: Update order status, trigger receipt
6. Handle error: Show user-friendly message

**Cash Change Calculation:**
```typescript
interface CashPaymentInput {
  orderTotal: number;      // e.g., 45.63
  amountTendered: number;  // e.g., 50.00
}

// Validation
if (amountTendered < orderTotal) {
  throw new Error('Insufficient amount');
}

// Calculate change
const changeDue = amountTendered - orderTotal; // 4.37
```

**Why No Payment Gateway?**
- Restaurants typically use standalone card terminals
- Reduces PCI compliance burden
- Simpler implementation and maintenance
- Works with any payment hardware
- Cash handling is always manual anyway

### 7.4 Receipt Printing

**Integration Type:** Browser print API + optional thermal printer

**Implementation Options:**
1. **Browser Print (MVP):**
   - Generate HTML receipt
   - Call `window.print()` with receipt stylesheet
   - Let browser handle printer selection

2. **Thermal Printer (Phase 2):**
   - Integrate with thermal printer SDK (e.g., EPSON ePOS)
   - Generate ESC/POS commands
   - Send via WebSocket to print server

**Receipt Content:**
- Store name and address
- Order number and date/time
- Itemized list with prices
- Subtotal, tax, service charge
- Discounts (if any)
- Total and payment method
- Change given (for cash)
- Footer message

### 7.5 Real-time Dashboard Updates

**Integration Type:** WebSocket subscription

**Implementation:**
- Leverage existing `useDashboardSocket` hook
- Listen for sales summary updates
- Auto-refresh daily stats panel
- No polling required

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric | Requirement |
|--------|-------------|
| Page load time | < 2 seconds (p95) |
| Menu item search | < 300ms response |
| Add to cart | < 100ms (optimistic UI) |
| Real-time updates | < 500ms propagation |
| Concurrent orders | Support 50+ active orders per store |

### 8.2 Usability

| Requirement | Description |
|-------------|-------------|
| Mobile responsive | Usable on tablets (min 768px) |
| Touch-friendly | Min touch target 44x44px |
| Keyboard navigation | Full keyboard support for power users |
| Accessibility | WCAG 2.1 AA compliance |
| Multi-language | Support all 4 languages (en, zh, my, th) |

### 8.3 Reliability

| Requirement | Description |
|-------------|-------------|
| Error handling | Graceful degradation with user-friendly messages |
| Data persistence | Cart survives page refresh (localStorage) |
| Optimistic updates | UI updates before server confirmation |
| Rollback | Revert UI on server error |

### 8.4 Security

| Requirement | Description |
|-------------|-------------|
| Authentication | JWT required for all API calls |
| Authorization | Role-based access (two levels: Cashier, Owner/Admin) |
| Audit logging | All financial transactions logged |
| Owner/Admin actions | Refunds, voids, large point redemptions require Owner/Admin PIN |

**Permission Matrix:**

| Action | Cashier | Owner/Admin |
|--------|---------|-------------|
| Create orders | ✅ | ✅ |
| Process payments | ✅ | ✅ |
| Apply standard discounts | ✅ | ✅ |
| Apply large point discounts | ❌ | ✅ |
| Void orders | ❌ | ✅ |
| Process refunds | ❌ | ✅ |
| Join/unjoin tables | ✅ (join only) | ✅ |
| View daily stats | ✅ | ✅ |
| View full reports | ❌ | ✅ |
| Modify settings | ❌ | ✅ |

---

## 9. Technical Recommendations

### 9.1 State Management

**Use Zustand for:**
- Current cart state
- Active order view selection
- UI preferences (collapsed panels, etc.)

**Use React Query for:**
- Menu items (cached, stale-while-revalidate)
- Active orders (polling + WebSocket invalidation)
- Order history (paginated, cached)
- Tables with status (real-time updates)

### 9.2 Component Architecture

```
features/sales/
├── components/
│   ├── SalesPage.tsx           # Main page component
│   ├── QuickActionsBar.tsx     # Top actions row
│   ├── MenuGrid.tsx            # Menu item grid
│   ├── MenuItemCard.tsx        # Individual menu item
│   ├── CartPanel.tsx           # Cart sidebar
│   ├── CartItem.tsx            # Cart item row
│   ├── PaymentPanel.tsx        # Payment flow
│   ├── ActiveOrdersBar.tsx     # Bottom orders ticker
│   ├── OrderCard.tsx           # Order summary card
│   ├── TablesView.tsx          # Table floor map
│   ├── TableCard.tsx           # Individual table
│   ├── PickupQueueView.tsx     # Takeaway queue
│   ├── DailyStatsPanel.tsx     # Stats sidebar
│   └── dialogs/
│       ├── DiscountDialog.tsx  # (existing)
│       ├── BillSplitDialog.tsx # (existing)
│       ├── RefundDialog.tsx    # New
│       └── OrderSearchDialog.tsx # New
├── hooks/
│   ├── useSalesCart.ts         # Cart state management
│   ├── useActiveOrders.ts      # Active orders query
│   └── useSalesSocket.ts       # Sales-specific socket events
├── services/
│   └── sales.service.ts        # Sales-specific API calls
├── store/
│   └── sales.store.ts          # Zustand store
├── types/
│   └── sales.types.ts          # Type definitions
└── queries/
    └── sales.keys.ts           # React Query keys
```

### 9.3 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New quick sale |
| `Ctrl/Cmd + T` | Open tables view |
| `Ctrl/Cmd + P` | Open pickup queue |
| `Ctrl/Cmd + F` | Search orders |
| `Ctrl/Cmd + D` | Toggle daily stats |
| `Enter` | Confirm current action |
| `Escape` | Cancel/close dialog |
| `1-9` | Select category (when focused) |

### 9.4 Translation Keys

Add to `messages/[locale]/sales.json`:

```json
{
  "sales": {
    "title": "Sales",
    "description": "Create and manage orders for your restaurant",
    "quickActions": {
      "newOrder": "New Order",
      "tables": "Tables",
      "pickup": "Pickup",
      "search": "Search",
      "stats": "Stats"
    },
    "menu": {
      "search": "Search items...",
      "categories": "Categories",
      "all": "All",
      "outOfStock": "Out of Stock",
      "dineIn": "Dine-in",
      "takeaway": "Takeaway"
    },
    "cart": {
      "title": "Current Order",
      "empty": "Cart is empty",
      "addItems": "Add items from the menu",
      "subtotal": "Subtotal",
      "vat": "VAT",
      "serviceCharge": "Service Charge",
      "total": "Total",
      "clear": "Clear",
      "discount": "Discount",
      "split": "Split",
      "pay": "Pay",
      "takeawayItem": "Takeaway"
    },
    "payment": {
      "title": "Payment",
      "recordOnly": "Record payment (no integration)",
      "method": "Payment Method",
      "cash": "Cash",
      "card": "Card",
      "mobile": "Mobile/E-Wallet",
      "other": "Other",
      "amountDue": "Amount Due",
      "amountPaid": "Amount Paid",
      "remaining": "Remaining",
      "tendered": "Amount Tendered",
      "quickAmounts": "Quick Amounts",
      "exact": "Exact",
      "change": "Change Due",
      "insufficientAmount": "Insufficient amount",
      "referenceNumber": "Reference Number (optional)",
      "notes": "Notes (optional)",
      "complete": "Complete Payment",
      "cancel": "Cancel"
    },
    "activeOrders": {
      "title": "Active Orders",
      "preparing": "Preparing",
      "ready": "Ready",
      "pendingPayment": "Pending Payment",
      "view": "View",
      "pay": "Pay",
      "done": "Done"
    },
    "tables": {
      "title": "Tables",
      "filter": "Filter",
      "floorMap": "Floor Map",
      "details": "Table Details",
      "startSession": "Start Session",
      "viewBill": "View Bill",
      "processPayment": "Record Payment",
      "closeTable": "Close Table",
      "joinTables": "Join Tables",
      "unjoinTables": "Unjoin Tables",
      "joinedWith": "Joined with",
      "selectTablesToJoin": "Select tables to join",
      "unjoinRequiresApproval": "Unjoin requires Owner/Admin approval"
    },
    "discount": {
      "title": "Apply Discount",
      "percentage": "Percentage",
      "fixedAmount": "Fixed Amount",
      "memberPoints": "Member Points",
      "enterMemberId": "Enter Member ID",
      "pointsBalance": "Points Balance",
      "redeemPoints": "Redeem Points",
      "pointsToRedeem": "Points to Redeem",
      "discountValue": "Discount Value",
      "redemptionRate": "points = $1",
      "requiresApproval": "Requires Owner/Admin approval",
      "enterPin": "Enter Owner/Admin PIN"
    },
    "stats": {
      "title": "Today's Summary",
      "totalSales": "Total Sales",
      "orders": "Orders",
      "average": "Avg",
      "breakdown": "Payment Breakdown",
      "topItems": "Top Items",
      "viewReport": "View Full Report"
    }
  }
}
```

---

## 10. Acceptance Criteria Summary

### Phase 1 (MVP) Acceptance Criteria

- [ ] **AC-M1:** Cashier can view menu items in a responsive grid with category filtering
- [ ] **AC-M2:** Cashier can add items to cart with quantity controls
- [ ] **AC-M3:** Cart displays running totals with tax and service charge
- [ ] **AC-M4:** Cashier can record cash payment with change calculation (tendered - total)
- [ ] **AC-M5:** Cashier can record card/mobile payment with optional reference number
- [ ] **AC-M6:** Active orders panel shows real-time order status
- [ ] **AC-M7:** Cashier can search orders by order number
- [ ] **AC-M8:** Receipt is generated after payment (browser print)
- [ ] **AC-M9:** Orders sent to kitchen via existing KDS integration
- [ ] **AC-M10:** All UI text uses translation keys (4 languages)

### Phase 2 Acceptance Criteria

- [ ] **AC-S1:** Cashier can view and select tables from floor map
- [ ] **AC-S2:** Cashier can start session and place orders for table
- [ ] **AC-S3:** Table status updates in real-time
- [ ] **AC-S4:** Cashier can join multiple tables into single session
- [ ] **AC-S5:** Unjoin tables requires Owner/Admin PIN if orders exist
- [ ] **AC-S6:** Cashier can mark individual items as "Takeaway" when ordering for a table
- [ ] **AC-S7:** Takeaway items display with special label in kitchen and on bill
- [ ] **AC-S8:** Cashier can split bill evenly among guests
- [ ] **AC-S9:** Cashier can apply percentage and fixed discounts
- [ ] **AC-S10:** Cashier can enter member ID and redeem points for discount
- [ ] **AC-S11:** Point redemptions above threshold require Owner/Admin PIN
- [ ] **AC-S12:** Daily stats panel shows sales summary
- [ ] **AC-S13:** Pickup queue shows ready takeaway orders
- [ ] **AC-S14:** Keyboard shortcuts work for common actions

---

## 11. Appendix

### A. Existing Services Reference

| Service | Location | Purpose |
|---------|----------|---------|
| order.service.ts | features/orders/services | Cart & checkout |
| session.service.ts | features/orders/services | Session management |
| payment.service.ts | features/payments/services | Payment recording |
| split-payment.service.ts | features/payments/services | Bill splitting |
| discount.service.ts | features/discounts/services | Discounts |
| table.service.ts | features/tables/services | Table CRUD |
| table-state.service.ts | features/tables/services | Table status |
| kitchen.service.ts | features/kitchen/services | KDS orders |
| report.service.ts | features/reports/services | Sales reports |

### B. Existing Components Reference

| Component | Location | Reusable? |
|-----------|----------|-----------|
| ManualOrderDialog | features/orders/components | Yes |
| PaymentDialog | features/payments/components | Yes |
| RefundVoidDialog | features/payments/components | Yes |
| DiscountDialog | features/discounts/components | Yes |
| BillSplittingDialog | features/payments/components | Yes |

### C. WebSocket Namespaces

| Namespace | Events | Hook |
|-----------|--------|------|
| /order | orderCreated, orderUpdated | useOrderSocket |
| /kitchen | orderStatusChanged | useKitchenSocket |
| /table | tableStatusChanged | useTableSocket |
| /dashboard | salesUpdated | useDashboardSocket |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-26 | Business Analyst Agent | Initial analysis |
| 1.1 | 2025-11-26 | Business Analyst Agent | Updated based on user feedback: simplified to 2 personas (Cashier, Owner/Admin), added Join Tables feature, added Takeaway from Table feature, added Member Points discount, clarified payment as record-only with cash change calculation |
