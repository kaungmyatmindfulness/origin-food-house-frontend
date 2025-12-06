import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OrderBaseResponseDto } from 'src/common/dto/base/order-base.dto';

/**
 * Order item response for SOS (customer-facing).
 * Contains only fields relevant to customers viewing their orders.
 */
export class SosOrderItemResponseDto {
  @ApiProperty({ description: 'Item ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Menu item name' })
  name: string;

  @ApiProperty({ description: 'Quantity ordered' })
  quantity: number;

  @ApiProperty({ description: 'Unit price', type: String })
  unitPrice: string;

  @ApiProperty({ description: 'Subtotal for this item', type: String })
  subtotal: string;

  @ApiPropertyOptional({
    description: 'Special instructions for this item',
    type: String,
    nullable: true,
  })
  specialInstructions: string | null;
}

/**
 * Order response DTO for SOS (Self-Ordering System).
 * Customer-facing response with minimal fields needed for order tracking.
 */
export class SosOrderResponseDto extends OrderBaseResponseDto {
  @ApiProperty({
    description: 'Order items',
    type: [SosOrderItemResponseDto],
  })
  items: SosOrderItemResponseDto[];

  @ApiPropertyOptional({
    description: 'Estimated preparation time in minutes',
    type: Number,
    nullable: true,
  })
  estimatedTime: number | null;

  @ApiPropertyOptional({
    description: 'Table number or name',
    type: String,
    nullable: true,
  })
  tableNumber: string | null;
}
