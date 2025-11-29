/**
 * User Types
 *
 * This file contains frontend-specific types for user data with store associations.
 * For standard API types, import directly from '@repo/api/generated/types'.
 *
 * Example:
 *   import type { CreateUserDto, UserProfileResponseDto } from '@repo/api/generated/types';
 */

import type { GetStoreDetailsResponseDto } from '@repo/api/generated/types';

/**
 * User roles available in the system.
 * Matches the backend's UserRole enum.
 *
 * TODO: Consider importing from generated types if backend exposes UserRole enum
 */
export type UserRole = 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';

/**
 * Represents a user's association with a store including their role.
 * Used in store selection and user profile views.
 *
 * TODO: This type should be generated from backend once GET /users/me
 * includes userStores in the OpenAPI spec.
 */
export interface UserStore {
  id: string;
  userId: string;
  storeId: string;
  role: UserRole;
  /**
   * Note: Uses the generated GetStoreDetailsResponseDto.
   * If you need extended fields (logoUrl, coverImageUrl, tier),
   * import from '@/features/store/types/store.types' instead.
   */
  store: GetStoreDetailsResponseDto;
}

/**
 * For GET /users/{id}/stores
 * Lightweight version without full store details.
 *
 * TODO: Should be generated from backend once endpoint is documented in OpenAPI
 */
export interface UserStoreRole {
  id: string;
  userId: string;
  storeId: string;
  role: string;
}

/**
 * Extended user profile with stores.
 * For GET /users/me - includes userStores which is not in generated UserProfileResponseDto.
 *
 * TODO: Remove this type once backend adds userStores to UserProfileResponseDto
 * in the OpenAPI spec.
 */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  userStores: UserStore[];
  selectedStoreRole: UserRole | null;
}
