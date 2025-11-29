/**
 * Store Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific extensions for features pending backend implementation.
 */

import type { GetStoreDetailsResponseDto as GeneratedStoreDetailsDto } from '@repo/api/generated/types';

// Re-export generated types directly
export type {
  UpdateStoreInformationDto,
  UpdateStoreSettingDto,
  CreateStoreDto,
  InviteOrAssignRoleDto,
  StoreInformationResponseDto,
  StoreSettingResponseDto,
} from '@repo/api/generated/types';

// Re-export business hours types from centralized utilities
// (backend returns businessHours as { [key: string]: unknown })
export type { BusinessHours, DayHours } from '@/common/types/api-type-fixes';

/**
 * Extended GetStoreDetailsResponseDto with fields pending backend implementation.
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
