export interface Category {
  id: number;
  name: string;
  storeId: number;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  menuItems?: Array<{
    id: number;
    name: string;
    description: string;
    basePrice: string;
    imageUrl: string;
    categoryId: number;
    storeId: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface SortMenuItemDto {
  id: number;
  sortOrder: number;
}

export interface SortCategoryDto {
  id: number;
  sortOrder: number;
  menuItems: SortMenuItemDto[];
}

export interface SortCategoriesPayloadDto {
  categories: SortCategoryDto[];
}
