import { ApiProperty } from '@nestjs/swagger';

/**
 * Base DTO for cart item responses containing common fields shared across all apps.
 * App-specific DTOs (SOS, RMS, Admin) should extend this base.
 */
export class CartItemBaseResponseDto {
  @ApiProperty({ description: 'Cart item ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Menu item name' })
  menuItemName: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit price', type: String })
  unitPrice: string;

  @ApiProperty({ description: 'Subtotal for this item', type: String })
  subtotal: string;
}
