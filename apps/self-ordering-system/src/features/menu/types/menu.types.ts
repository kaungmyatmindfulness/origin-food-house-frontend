/**
 * Supported locales in the application
 */
export type SupportedLocale = 'en' | 'zh' | 'my' | 'th';

/**
 * Base translation structure (name only)
 */
export interface BaseTranslation {
  locale: SupportedLocale;
  name: string;
}

/**
 * Translation with description (for menu items)
 */
export interface TranslationWithDescription extends BaseTranslation {
  description?: string | null;
}

/**
 * Translation map type
 */
export type TranslationMap<T = BaseTranslation> = Partial<
  Record<SupportedLocale, T>
>;

export interface Category {
  id: string;
  name: string;
  storeId: string;
  sortOrder: number;
  menuItems: MenuItem[];
  translations?: TranslationMap<BaseTranslation>;
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
  translations?: TranslationMap<TranslationWithDescription>;
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
  translations?: TranslationMap<BaseTranslation>;
}

export interface CustomizationOption {
  id: string;
  name: string;
  additionalPrice?: string | null;
  customizationGroupId: string;
  translations?: TranslationMap<BaseTranslation>;
}
