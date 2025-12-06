import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SessionStatus, SessionType } from 'src/generated/prisma/client';

/**
 * Admin session response with analytics for platform administration
 */
export class AdminSessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Store ID' })
  storeId: string;

  @ApiProperty({ type: String, description: 'Table ID', nullable: true })
  tableId: string | null;

  @ApiProperty({ description: 'Table number' })
  tableNumber: string;

  @ApiProperty({
    description: 'Session type',
    enum: SessionType,
  })
  sessionType: SessionType;

  @ApiProperty({ description: 'Session status', enum: SessionStatus })
  status: SessionStatus;

  @ApiPropertyOptional({
    type: Number,
    description: 'Guest count',
    nullable: true,
  })
  guestCount?: number | null;

  @ApiProperty({ description: 'Number of orders in session' })
  orderCount: number;

  @ApiProperty({ description: 'Total amount spent', type: 'string' })
  totalSpent: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer name',
    nullable: true,
  })
  customerName: string | null;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer phone number',
    nullable: true,
  })
  customerPhone: string | null;

  @ApiProperty({ description: 'Session started at' })
  createdAt: Date;

  @ApiProperty({ description: 'Session updated at' })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Session closed at',
    nullable: true,
  })
  closedAt: Date | null;
}
