import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { SessionStatus } from 'src/generated/prisma/client';

export class UpdateSessionDto {
  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
