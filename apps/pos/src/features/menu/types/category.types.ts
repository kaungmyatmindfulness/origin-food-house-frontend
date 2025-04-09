export interface Category {
  id: number;
  name: string;
  storeId: number;
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
