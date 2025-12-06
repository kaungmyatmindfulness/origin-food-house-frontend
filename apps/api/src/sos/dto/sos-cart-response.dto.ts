import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Customization selection DTO for cart items in SOS.
 * Represents a customer's selected customization option.
 */
export class SosCartItemCustomizationDto {
  @ApiProperty({ description: 'Customization group name (e.g., "Size")' })
  name: string;

  @ApiProperty({ description: 'Selected option (e.g., "Large")' })
  selectedOption: string;

  @ApiProperty({
    description: 'Additional price for this selection',
    type: String,
  })
  additionalPrice: string;
}

/**
 * Cart item response DTO for SOS (Self-Ordering System).
 * Contains item details as they appear in the customer's cart.
 */
export class SosCartItemResponseDto {
  @ApiProperty({ description: 'Cart item ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Menu item ID', format: 'uuid' })
  menuItemId: string;

  @ApiProperty({ description: 'Menu item name' })
  menuItemName: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({
    description: 'Unit price (base + customizations)',
    type: String,
  })
  unitPrice: string;

  @ApiProperty({ description: 'Subtotal for this item', type: String })
  subtotal: string;

  @ApiPropertyOptional({
    description: 'Special instructions from customer',
    type: String,
    nullable: true,
  })
  specialInstructions: string | null;

  @ApiProperty({
    description: 'Selected customizations',
    type: [SosCartItemCustomizationDto],
  })
  @Type(() => SosCartItemCustomizationDto)
  customizations: SosCartItemCustomizationDto[];
}

/**
 * Cart response DTO for SOS (Self-Ordering System).
 * Customer-facing cart view with all items and totals.
 */
export class SosCartResponseDto {
  @ApiProperty({ description: 'Session ID', format: 'uuid' })
  sessionId: string;

  @ApiProperty({
    description: 'Cart items',
    type: [SosCartItemResponseDto],
  })
  @Type(() => SosCartItemResponseDto)
  items: SosCartItemResponseDto[];

  @ApiProperty({
    description: 'Cart subtotal (before tax/charges)',
    type: String,
  })
  subtotal: string;

  @ApiProperty({ description: 'Total number of items in cart' })
  itemCount: number;
}
