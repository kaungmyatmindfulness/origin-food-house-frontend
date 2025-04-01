export interface VariationDto {
  name: string;
  additionalPrice: number;
}

export interface SizeDto {
  name: string;
  additionalPrice: number;
}

export interface AddOnOptionDto {
  name: string;
  additionalPrice: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  imageKey?: string;
  categoryId?: number;
  variations?: VariationDto[];
  sizes?: SizeDto[];
  addOnOptions?: AddOnOptionDto[];
  // plus any other fields (createdAt, updatedAt, etc.) if returned by the API
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  basePrice: number;
  imageKey?: string;
  categoryId?: number;
  variations?: VariationDto[];
  sizes?: SizeDto[];
  addOnOptions?: AddOnOptionDto[];
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {}
