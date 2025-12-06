import { ApiProperty } from '@nestjs/swagger';

/**
 * Base DTO for order responses containing common fields shared across all apps.
 * App-specific DTOs (SOS, RMS, Admin) should extend this base.
 */
export class OrderBaseResponseDto {
  @ApiProperty({ description: 'Order ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Order number for display' })
  orderNumber: string;

  @ApiProperty({
    description: 'Order status',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'SERVED',
      'COMPLETED',
      'CANCELLED',
    ],
  })
  status: string;

  @ApiProperty({ description: 'Grand total amount', type: String })
  grandTotal: string;

  @ApiProperty({ description: 'Order creation timestamp' })
  createdAt: Date;
}
