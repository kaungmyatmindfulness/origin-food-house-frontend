export interface Category {
  id: string;
  name: string;
  storeId: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  menuItems?: Array<{
    id: string;
    name: string;
    description: string;
    basePrice: string;
    imageUrl: string;
    categoryId: string;
    storeId: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    isOutOfStock?: boolean;
  }>;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface SortMenuItemDto {
  id: string;
  sortOrder: number;
}

export interface SortCategoryDto {
  id: string;
  sortOrder: number;
  menuItems: SortMenuItemDto[];
}

export interface SortCategoriesPayloadDto {
  categories: SortCategoryDto[];
}
