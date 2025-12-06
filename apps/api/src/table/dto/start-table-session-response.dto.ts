import { ApiProperty } from '@nestjs/swagger';

import { SessionStatus, SessionType } from 'src/generated/prisma/client';

/**
 * Response DTO for starting a table session from RMS (staff-initiated)
 * Used when staff clicks on an AVAILABLE/VACANT table in the Table Sale view.
 *
 * Note: Session token is excluded since this is for authenticated staff use.
 * The session token is only needed for customer self-ordering (QR code scan).
 */
export class StartTableSessionResponseDto {
  @ApiProperty({ description: 'Session ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Table ID', format: 'uuid' })
  tableId: string;

  @ApiProperty({ description: 'Table name/number for display', example: 'T-1' })
  tableName: string;

  @ApiProperty({ description: 'Store ID', format: 'uuid' })
  storeId: string;

  @ApiProperty({
    description: 'Session type',
    enum: SessionType,
    default: SessionType.TABLE,
  })
  sessionType: SessionType;

  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}
