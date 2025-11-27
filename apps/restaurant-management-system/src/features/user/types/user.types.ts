/**
 * User Types
 *
 * Re-exports auto-generated types from @repo/api and provides
 * frontend-specific extensions for user data with store associations.
 */

import type { GetStoreDetailsResponseDto } from '@/features/store/types/store.types';

// Re-export generated types that can be used directly
export type {
  CreateUserDto,
  AddUserToStoreDto,
  UserProfileResponseDto,
  InviteStaffDto,
  ChangeRoleDto,
} from '@repo/api/generated/types';

/**
 * User roles available in the system.
 * Matches the backend's UserRole enum.
 */
export type UserRole = 'OWNER' | 'ADMIN' | 'CASHIER' | 'CHEF';

/**
 * Represents a user's association with a store including their role.
 * Used in store selection and user profile views.
 */
export interface UserStore {
  id: string;
  userId: string;
  storeId: string;
  role: UserRole;
  store: GetStoreDetailsResponseDto;
}

/**
 * For GET /users/{id}/stores
 * Lightweight version without full store details.
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
 * Note: The generated UserProfileResponseDto doesn't include userStores.
 * This type extends it for the actual API response shape.
 */
export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  userStores: UserStore[];
  selectedStoreRole: UserRole | null;
}
