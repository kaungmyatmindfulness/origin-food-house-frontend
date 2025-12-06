import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer'; // Use if ClassSerializerInterceptor is global

import { TableStatus } from 'src/generated/prisma/client';

export class TableResponseDto {
  @ApiProperty({ format: 'uuid' }) @Expose() id: string;
  @ApiProperty({ format: 'uuid' }) @Expose() storeId: string;
  @ApiProperty({ example: 'Table 10' }) @Expose() name: string;
  @ApiProperty({
    enum: TableStatus,
    enumName: 'TableStatus',
    example: TableStatus.VACANT,
    description: 'Current status of the table',
  })
  @Expose()
  currentStatus: TableStatus;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'ID of the currently active session for this table, if any',
    example: '0193d8a9-4b5c-7d6e-8f9a-0b1c2d3e4f5a',
  })
  @Expose()
  currentSessionId: string | null;

  @ApiPropertyOptional({
    type: 'string',
    nullable: true,
    description:
      'Total amount of all unpaid orders for the current session (as decimal string)',
    example: '125.50',
  })
  @Expose()
  currentOrderTotal: string | null;

  @ApiProperty() @Expose() createdAt: Date;
  @ApiProperty() @Expose() updatedAt: Date;
}
