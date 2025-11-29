/**
 * Store Types
 *
 * This file contains frontend-specific type extensions for store data.
 * For standard API types, import directly from '@repo/api/generated/types'.
 *
 * Example:
 *   import type { CreateStoreDto, UpdateStoreSettingDto } from '@repo/api/generated/types';
 */

import type { GetStoreDetailsResponseDto as GeneratedStoreDetailsDto } from '@repo/api/generated/types';

/**
 * Extended GetStoreDetailsResponseDto with fields pending backend implementation.
 *
 * TODO: Remove this extension once backend adds these fields to the API response:
 * - logoUrl: Store logo URL
 * - coverImageUrl: Store cover image URL
 * - tier: Store subscription tier for feature gating
 *
 * @see settings/page.tsx - BrandingTab and LoyaltyProgramTab use these fields
 */
export type GetStoreDetailsResponseDto = GeneratedStoreDetailsDto & {
  /** Store logo URL (pending backend) */
  logoUrl?: string | null;
  /** Store cover image URL (pending backend) */
  coverImageUrl?: string | null;
  /** Store tier for feature gating (pending backend) */
  tier?: 'FREE' | 'STANDARD' | 'PREMIUM';
};

/**
 * Alias for GetStoreDetailsResponseDto for backwards compatibility.
 * @deprecated Prefer using GetStoreDetailsResponseDto directly
 */
export type Store = GetStoreDetailsResponseDto;
