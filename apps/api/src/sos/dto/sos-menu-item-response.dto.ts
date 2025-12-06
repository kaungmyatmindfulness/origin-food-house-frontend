import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { MenuItemBaseResponseDto } from 'src/common/dto/base/menu-item-base.dto';
import {
  TranslationMap,
  TranslationWithDescriptionResponseDto,
} from 'src/common/dto/translation.dto';

/**
 * Customization option DTO for SOS menu item detail view.
 */
export class SosCustomizationOptionDto {
  @ApiProperty({ description: 'Option ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Option name' })
  name: string;

  @ApiProperty({
    description: 'Additional price for this option',
    type: String,
  })
  additionalPrice: string;
}

/**
 * Customization group DTO for SOS menu item detail view.
 * Contains groups of options customers can select (e.g., size, toppings).
 */
export class SosCustomizationGroupDto {
  @ApiProperty({ description: 'Group ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Group name (e.g., "Size", "Toppings")' })
  name: string;

  @ApiProperty({ description: 'Whether selection is required' })
  isRequired: boolean;

  @ApiProperty({ description: 'Maximum selections allowed' })
  maxSelections: number;

  @ApiProperty({
    description: 'Available options in this group',
    type: [SosCustomizationOptionDto],
  })
  @Type(() => SosCustomizationOptionDto)
  options: SosCustomizationOptionDto[];
}

/**
 * Menu item response DTO for SOS (Self-Ordering System).
 * Full detail view for a single menu item including customization options.
 */
export class SosMenuItemResponseDto extends MenuItemBaseResponseDto {
  @ApiPropertyOptional({
    description: 'Item description',
    type: String,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: 'Category ID', format: 'uuid' })
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Customization groups (e.g., sizes, toppings)',
    type: [SosCustomizationGroupDto],
  })
  @Type(() => SosCustomizationGroupDto)
  customizations?: SosCustomizationGroupDto[];

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/TranslationWithDescriptionResponseDto',
    },
    description: 'Item translations by locale',
    example: {
      en: {
        locale: 'en',
        name: 'Pad Thai',
        description: 'Thai stir-fried noodles',
      },
      th: {
        locale: 'th',
        name: 'ผัดไทย',
        description: 'ก๋วยเตี๋ยวผัดไทย',
      },
    },
    nullable: true,
  })
  translations?: TranslationMap<TranslationWithDescriptionResponseDto>;
}
