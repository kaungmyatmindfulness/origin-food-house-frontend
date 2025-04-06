/**
 * DTO used within MenuItem DTOs to link or create a category.
 * If ID is provided, links/updates existing. If only name, creates new.
 */
export interface UpsertCategoryDto {
  id?: number;
  name: string;
}

/**
 * DTO used within CustomizationGroup DTOs to add or update an option.
 * Provide ID to update existing, omit ID to create new.
 */
export interface UpsertCustomizationOptionDto {
  id?: number;
  name: string;
  additionalPrice?: number;
}

/**
 * DTO used within MenuItem DTOs to add or update a customization group.
 * Provide ID to update existing, omit ID to create new.
 */
export interface UpsertCustomizationGroupDto {
  id?: number;
  name: string;
  required?: boolean;
  minSelectable?: number;
  maxSelectable?: number;
  options: UpsertCustomizationOptionDto[];
}

/**
 * Represents a Category object as returned within a MenuItemDto.
 */
export interface CategoryDto {
  id: number;
  name: string;
}

/**
 * Represents a Customization Option object as returned within a MenuItemDto.
 */
export interface CustomizationOptionDto {
  id: number;
  name: string;
  additionalPrice: number;
}

/**
 * Represents a Customization Group object as returned within a MenuItemDto.
 */
export interface CustomizationGroupDto {
  id: number;
  name: string;
  required: boolean;
  minSelectable: number;
  maxSelectable: number;
  options: CustomizationOptionDto[];
}

/**
 * DTO for creating a new menu item (request body for POST /menu).
 */
export interface CreateMenuItemDto {
  name: string;
  description?: string;
  basePrice: number;
  imageKey?: string;
  category: UpsertCategoryDto;
  customizationGroups?: UpsertCustomizationGroupDto[];
}

/**
 * DTO for updating an existing menu item (request body for PUT /menu/{id}).
 * Note: Sending customizationGroups here is a *full replacement*.
 * Existing groups/options NOT included (by ID) WILL BE DELETED.
 */
export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  basePrice?: number;
  imageKey?: string;
  category?: UpsertCategoryDto;
  customizationGroups?: UpsertCustomizationGroupDto[];
}

/**
 * Represents a full MenuItem object as returned by the API (e.g., in GET responses).
 */
export interface MenuItemDto {
  id: number;
  name: string;
  description?: string | null;
  basePrice: number;
  imageKey?: string | null;
  category: CategoryDto;
  customizationGroups: CustomizationGroupDto[];
}

// {
//   id: 13,
//   name: 'Apricot-glazed Emu Skewers',
//   description:
//     'A succulent turkey steak, encased in a spicy ajwan seed crust, served with a side of garlic mashed sweet potato.',
//   basePrice: 13.09,
//   imageKey: 'uploads/fd9d6802-095b-4d4c-95f7-79e9aa6d9125-original',
//   categoryId: 10,
//   storeId: 1,
//   createdAt: '2025-03-26T21:03:34.504Z',
//   updatedAt: '2025-03-26T21:03:34.504Z',
// },

export interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  basePrice: number;
  imageKey?: string | null;
  categoryId: number;
  storeId: number;
  createdAt: string;
  updatedAt: string;
}
