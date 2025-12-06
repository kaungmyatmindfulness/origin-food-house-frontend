import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { CategoryBaseResponseDto } from 'src/common/dto/base/category-base.dto';

/**
 * Simplified menu item DTO for category listing in SOS.
 * Contains only essential fields for menu browsing.
 */
export class SosMenuItemSimpleDto {
  @ApiProperty({ description: 'Menu item ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Menu item name' })
  name: string;

  @ApiProperty({ description: 'Price', type: String })
  price: string;

  @ApiPropertyOptional({
    description: 'Image path (base path for S3)',
    type: String,
    nullable: true,
  })
  imagePath: string | null;

  @ApiProperty({ description: 'Is available for ordering' })
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Short description',
    type: String,
    nullable: true,
  })
  description: string | null;
}

/**
 * Category response DTO for SOS (Self-Ordering System).
 * Customer-facing response with categories and their menu items.
 */
export class SosCategoryResponseDto extends CategoryBaseResponseDto {
  @ApiProperty({
    description: 'Menu items in this category',
    type: [SosMenuItemSimpleDto],
  })
  @Type(() => SosMenuItemSimpleDto)
  items: SosMenuItemSimpleDto[];
}
