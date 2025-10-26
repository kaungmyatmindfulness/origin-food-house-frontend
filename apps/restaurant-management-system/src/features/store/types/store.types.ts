// Import generated types from OpenAPI spec
import type {
  GetStoreDetailsResponseDto as GeneratedStoreDetailsDto,
  StoreSettingResponseDto as GeneratedStoreSettingDto,
  StoreInformationResponseDto as GeneratedStoreInformationDto,
  UpdateStoreInformationDto,
  UpdateStoreSettingDto,
} from '@repo/api/generated/types';

// Re-export generated types for backwards compatibility
export type { UpdateStoreInformationDto, UpdateStoreSettingDto };

/**
 * Extended StoreInformationResponseDto with correct field types.
 *
 * The generated types incorrectly type these fields as `{ [key: string]: unknown }`.
 * This extension provides the correct string types for these fields.
 *
 * @see GeneratedStoreInformationDto for base fields from backend
 */
export interface StoreInformationResponseDto
  extends Omit<
    GeneratedStoreInformationDto,
    'logoUrl' | 'address' | 'phone' | 'email' | 'website'
  > {
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

/**
 * Extended StoreSettingResponseDto with fields pending backend implementation.
 *
 * These fields are used in the frontend for features being developed:
 * - Loyalty program configuration
 * - Business hours management
 *
 * @see GeneratedStoreSettingDto for base fields from backend
 */
export interface StoreSettingResponseDto extends GeneratedStoreSettingDto {
  /** Loyalty program enabled flag (pending backend) */
  loyaltyEnabled?: boolean;
  /** Points earned per currency unit (pending backend) */
  loyaltyPointRate?: string;
  /** Redemption rate for points (pending backend) */
  loyaltyRedemptionRate?: string;
  /** Days until loyalty points expire (pending backend) */
  loyaltyExpiryDays?: number;
  /** Weekly business hours (pending backend) */
  businessHours?: {
    monday: { closed: boolean; open?: string; close?: string };
    tuesday: { closed: boolean; open?: string; close?: string };
    wednesday: { closed: boolean; open?: string; close?: string };
    thursday: { closed: boolean; open?: string; close?: string };
    friday: { closed: boolean; open?: string; close?: string };
    saturday: { closed: boolean; open?: string; close?: string };
    sunday: { closed: boolean; open?: string; close?: string };
  };
}

/**
 * Extended GetStoreDetailsResponseDto with fields pending backend implementation.
 *
 * These fields are used in the frontend for features being developed:
 * - Store branding (logo, cover image)
 * - Tier-based features
 *
 * @see GeneratedStoreDetailsDto for base fields from backend
 */
export interface GetStoreDetailsResponseDto
  extends Omit<GeneratedStoreDetailsDto, 'setting' | 'information'> {
  /** Store logo URL (pending backend) */
  logoUrl?: string;
  /** Store cover image URL (pending backend) */
  coverImageUrl?: string;
  /** Store tier for feature gating (pending backend) */
  tier?: 'FREE' | 'STANDARD' | 'PREMIUM';
  /** Extended store information with correct field types */
  information: StoreInformationResponseDto;
  /** Extended store settings with additional fields */
  setting: StoreSettingResponseDto;
}

/**
 * Alias for GetStoreDetailsResponseDto for backwards compatibility.
 * Use GetStoreDetailsResponseDto directly in new code for clarity.
 */
export type Store = GetStoreDetailsResponseDto;

/**
 * DTO for creating a new store.
 * Maps to backend CreateStoreDto.
 */
export interface CreateStoreDto {
  name: string;
  address?: string;
  phone?: string;
}

/**
 * DTO for inviting or assigning roles to users.
 * Used in personnel management features.
 */
export interface InviteOrAssignRoleDto {
  email: string;
  role: 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';
}
