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
