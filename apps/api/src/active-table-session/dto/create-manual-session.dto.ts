import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { SessionType } from 'src/generated/prisma/client';

export class CreateManualSessionDto {
  @ApiProperty({
    description: 'Type of manual session (COUNTER, PHONE, or TAKEOUT)',
    enum: SessionType,
    example: SessionType.COUNTER,
  })
  @IsEnum(SessionType)
  sessionType: SessionType;

  @ApiProperty({
    description: 'Optional customer name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  customerName?: string;

  @ApiProperty({
    description: 'Optional customer phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  customerPhone?: string;
}
