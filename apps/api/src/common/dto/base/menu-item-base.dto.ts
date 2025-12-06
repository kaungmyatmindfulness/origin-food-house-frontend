import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Base DTO for menu item responses containing common fields shared across all apps.
 * App-specific DTOs (SOS, RMS, Admin) should extend this base.
 */
export class MenuItemBaseResponseDto {
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

  @ApiProperty({ description: 'Whether item is available for ordering' })
  isAvailable: boolean;
}
