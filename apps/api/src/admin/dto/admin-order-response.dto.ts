import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  OrderStatus,
  OrderType,
  DiscountType,
} from 'src/generated/prisma/client';

/**
 * Admin order item response for platform administration
 */
export class AdminOrderItemResponseDto {
  @ApiProperty({ description: 'Order item ID' })
  id: string;

  @ApiProperty({ type: String, description: 'Menu item ID', nullable: true })
  menuItemId: string | null;

  @ApiProperty({ description: 'Menu item name' })
  menuItemName: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit price', type: 'string' })
  unitPrice: string;

  @ApiProperty({ description: 'Subtotal', type: 'string' })
  subtotal: string;
}

/**
 * Admin order analytics for platform insights
 */
export class AdminOrderAnalyticsDto {
  @ApiProperty({
    type: Number,
    description: 'Time to prepare in minutes',
    nullable: true,
  })
  prepareTimeMinutes: number | null;

  @ApiProperty({
    type: Number,
    description: 'Time from order to completion in minutes',
    nullable: true,
  })
  totalTimeMinutes: number | null;

  @ApiProperty({ description: 'Number of items in order' })
  itemCount: number;

  @ApiProperty({ description: 'Average item price', type: 'string' })
  averageItemPrice: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Discount applied',
    nullable: true,
  })
  discountApplied?: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Discount reason',
    nullable: true,
  })
  discountReason?: string | null;
}

/**
 * Store info for admin order response
 */
export class AdminOrderStoreInfoDto {
  @ApiProperty({ description: 'Store ID' })
  id: string;

  @ApiProperty({ description: 'Store name' })
  name: string;

  @ApiProperty({ description: 'Store slug' })
  slug: string;
}

/**
 * Admin order response with analytics for platform administration
 */
export class AdminOrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Order number' })
  orderNumber: string;

  @ApiProperty({ description: 'Store ID' })
  storeId: string;

  @ApiProperty({
    description: 'Store information',
    type: AdminOrderStoreInfoDto,
  })
  store: AdminOrderStoreInfoDto;

  @ApiProperty({ type: String, description: 'Session ID', nullable: true })
  sessionId: string | null;

  @ApiProperty({ description: 'Table name' })
  tableName: string;

  @ApiProperty({ enum: OrderStatus, description: 'Order status' })
  status: OrderStatus;

  @ApiProperty({ enum: OrderType, description: 'Order type' })
  orderType: OrderType;

  @ApiProperty({
    description: 'Order items',
    type: [AdminOrderItemResponseDto],
  })
  items: AdminOrderItemResponseDto[];

  @ApiProperty({ description: 'Subtotal before tax/service', type: 'string' })
  subtotal: string;

  @ApiProperty({ description: 'Tax amount', type: 'string' })
  taxAmount: string;

  @ApiProperty({ description: 'Service charge', type: 'string' })
  serviceCharge: string;

  @ApiProperty({ description: 'Grand total', type: 'string' })
  grandTotal: string;

  @ApiPropertyOptional({
    enum: DiscountType,
    description: 'Discount type',
    nullable: true,
  })
  discountType?: DiscountType | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Discount amount',
    nullable: true,
  })
  discountAmount?: string | null;

  @ApiProperty({ description: 'Total paid so far', type: 'string' })
  totalPaid: string;

  @ApiProperty({ description: 'Remaining balance', type: 'string' })
  remainingBalance: string;

  @ApiProperty({ description: 'Whether fully paid' })
  isPaidInFull: boolean;

  @ApiProperty({ type: Date, description: 'Paid at timestamp', nullable: true })
  paidAt: Date | null;

  @ApiProperty({
    description: 'Order analytics',
    type: AdminOrderAnalyticsDto,
  })
  analytics: AdminOrderAnalyticsDto;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
