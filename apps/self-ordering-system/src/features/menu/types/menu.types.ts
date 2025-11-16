export interface Category {
  id: string;
  name: string;
  storeId: string;
  sortOrder: number;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: string;
  imagePath?: string;
  categoryId: string;
  storeId: string;
  sortOrder: number;
  customizationGroups: CustomizationGroup[];
}

export type MenuItemBasic = Pick<
  MenuItem,
  'id' | 'name' | 'basePrice' | 'imagePath'
>;

export interface CustomizationGroup {
  id: string;
  name: string;
  minSelectable: number;
  maxSelectable: number;
  menuItemId: string;
  customizationOptions: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  additionalPrice?: string | null;
  customizationGroupId: string;
}
