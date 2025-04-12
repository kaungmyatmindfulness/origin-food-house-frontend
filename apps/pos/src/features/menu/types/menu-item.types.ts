/**
 * DTO used within MenuItem DTOs to link or create a category.
 * If ID is provided, links/updates existing. If only name, creates new.
 */
export interface UpsertCategoryDto {
  id?: string;
  name: string;
}

/**
 * DTO used within CustomizationGroup DTOs to add or update an option.
 * Provide ID to update existing, omit ID to create new.
 */
export interface UpsertCustomizationOptionDto {
  id?: string;
  name: string;
  additionalPrice?: string;
}

/**
 * DTO used within MenuItem DTOs to add or update a customization group.
 * Provide ID to update existing, omit ID to create new.
 */
export interface UpsertCustomizationGroupDto {
  id?: string;
  name: string;
  minSelectable?: number;
  maxSelectable?: number;
  options: UpsertCustomizationOptionDto[];
}

/**
 * Represents a Category object as returned within a MenuItemDto.
 */
export interface CategoryDto {
  id: string;
  name: string;
}

/**
 * Represents a Customization Option object as returned within a MenuItemDto.
 */
export interface CustomizationOptionDto {
  id: string;
  name: string;
  additionalPrice: string;
}

/**
 * Represents a Customization Group object as returned within a MenuItemDto.
 */
export interface CustomizationGroupDto {
  id: string;
  name: string;
  required: boolean;
  minSelectable: number;
  maxSelectable: number;
  customizationOptions: CustomizationOptionDto[];
}

/**
 * DTO for creating a new menu item (request body for POST /menu).
 */
export interface CreateMenuItemDto {
  name: string;
  description?: string;
  basePrice: string;
  imageUrl?: string;
  category: UpsertCategoryDto;
  customizationGroups?: UpsertCustomizationGroupDto[];
  isHidden?: boolean;
}

export type UpdateMenuItemDto = CreateMenuItemDto;

/**
 * Represents a full MenuItem object as returned by the API (e.g., in GET responses).
 */
export interface MenuItemDto {
  id: string;
  name: string;
  description?: string | null;
  basePrice: string;
  imageUrl?: string | null;
  category: CategoryDto;
  customizationGroups: CustomizationGroupDto[];
  isHidden: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  basePrice: string;
  imageUrl?: string | null;
  categoryId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}
