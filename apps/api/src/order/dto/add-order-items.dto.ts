import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * DTO for individual items to add to an existing order
 */
export class AddOrderItemDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Array of customization option IDs',
    example: ['550e8400-e29b-41d4-a716-446655440001'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(7, { each: true })
  customizationOptionIds?: string[];

  @ApiPropertyOptional({
    description: 'Notes for the item',
    example: 'No onions',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for adding items to an existing order
 *
 * This endpoint allows staff to add more items to an order that has already been created,
 * for example when customers order additional items during their meal.
 */
export class AddOrderItemsDto {
  @ApiProperty({
    description: 'Array of items to add to the order',
    type: [AddOrderItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  items: AddOrderItemDto[];
}
