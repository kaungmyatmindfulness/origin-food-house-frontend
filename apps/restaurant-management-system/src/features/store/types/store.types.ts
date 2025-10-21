export interface CreateStoreDto {
  name: string;
  address?: string;
  phone?: string;
}

/** Represents a store returned by the backend */

export interface Information {
  id: string;
  storeId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the detailed store information.
 * Assuming this structure based on UpdateStoreInformationDto and common patterns.
 * Corresponds roughly to the 'information' part of the old Store type.
 * NOTE: Adjust if the actual GetStoreDetailsResponseDto structure differs significantly.
 */
export interface StoreInformationDto {
  id: string;
  storeId: string;
  name: string;
  logoUrl?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the store settings data returned by the API.
 * Maps to: Schema StoreSettingResponseDto (assuming structure based on Update DTO)
 * NOTE: Adjust based on actual API response.
 */
export interface StoreSettingResponseDto {
  currency: string;
  vatRate: string | null;
  serviceChargeRate: string | null;
}

/**
 * Represents the full store details returned by GET /stores/{id}.
 * Maps to: Schema GetStoreDetailsResponseDto (assuming structure)
 * NOTE: Adjust based on actual API response.
 */
export interface GetStoreDetailsResponseDto {
  id: string;
  slug: string;
  information: StoreInformationDto;
  setting: StoreSettingResponseDto;
}

/**
 * DTO for the request body when updating store information.
 * Maps to: Schema UpdateStoreInformationDto (Request Body for PUT /stores/{id}/information)
 */
export interface UpdateStoreInformationDto {
  /** Store's display name (Required) */
  name: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Available currency codes based on the spec's enum.
 * Optional: Use this for better type safety than just string.
 */
export type StoreCurrency =
  | 'THB'
  | 'MMK'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CNY'
  | 'AUD'
  | 'CAD'
  | 'NZD'
  | 'SGD'
  | 'HKD'
  | 'INR'
  | 'IDR'
  | 'PHP'
  | 'MYR'
  | 'VND'
  | 'PKR'
  | 'BDT'
  | 'AED'
  | 'SAR';

/**
 * DTO for the request body when updating store settings.
 * Maps to: Schema UpdateStoreSettingDto (Request Body for PUT /stores/{id}/settings)
 */
export interface UpdateStoreSettingDto {
  /** Update the default currency for the store. */
  currency?: StoreCurrency | string;
  /** Update VAT rate (e.g., "0.07"). Send null to remove. */
  vatRate?: string | null;
  /** Update Service Charge rate (e.g., "0.10"). Send null to remove. */
  serviceChargeRate?: string | null;
}

export interface CreateStoreDto {
  name: string;
}

export interface InviteOrAssignRoleDto {
  email: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';
}

export type Store = GetStoreDetailsResponseDto;
