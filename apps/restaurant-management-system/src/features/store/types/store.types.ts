/**
 * Store Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific extensions for features pending backend implementation.
 */

// Import generated types from OpenAPI spec
import type {
  GetStoreDetailsResponseDto as GeneratedStoreDetailsDto,
  StoreSettingResponseDto as GeneratedStoreSettingDto,
  StoreInformationResponseDto as GeneratedStoreInformationDto,
} from '@repo/api/generated/types';

// Re-export generated types that can be used directly
export type {
  UpdateStoreInformationDto,
  UpdateStoreSettingDto,
  CreateStoreDto,
  InviteOrAssignRoleDto,
  StoreUsageDto,
} from '@repo/api/generated/types';

/**
 * Extended StoreInformationResponseDto with correct field types.
 *
 * The generated types incorrectly type some fields as `Record<string, never>`.
 * This extension provides the correct string types for these fields.
 *
 * Note: We omit and redefine all nullable string fields to fix the type mismatch.
 *
 * @see GeneratedStoreInformationDto for base fields from backend
 */
export interface StoreInformationResponseDto
  extends Omit<
    GeneratedStoreInformationDto,
    'logoPath' | 'coverPhotoPath' | 'address' | 'phone' | 'email' | 'website' | 'description'
  > {
  logoPath?: string | null;
  coverPhotoPath?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
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
 * Note: information and setting can be null if the store is newly created
 * and hasn't been fully configured yet.
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
  /** Extended store information with correct field types (null if not configured) */
  information: StoreInformationResponseDto | null;
  /** Extended store settings with additional fields (null if not configured) */
  setting: StoreSettingResponseDto | null;
}

/**
 * Alias for GetStoreDetailsResponseDto for backwards compatibility.
 * Use GetStoreDetailsResponseDto directly in new code for clarity.
 *
 * @deprecated Prefer using GetStoreDetailsResponseDto directly
 */
export type Store = GetStoreDetailsResponseDto;
