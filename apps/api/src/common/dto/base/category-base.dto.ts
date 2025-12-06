import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  TranslationMap,
  BaseTranslationResponseDto,
} from 'src/common/dto/translation.dto';

/**
 * Base DTO for category responses containing common fields shared across all apps.
 * App-specific DTOs (SOS, RMS, Admin) should extend this base.
 */
export class CategoryBaseResponseDto {
  @ApiProperty({ description: 'Category ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/BaseTranslationResponseDto',
    },
    description: 'Category translations by locale',
    example: {
      en: { locale: 'en', name: 'Appetizers' },
      th: { locale: 'th', name: 'อาหารเรียกน้ำย่อย' },
    },
    nullable: true,
  })
  translations?: TranslationMap<BaseTranslationResponseDto>;
}
