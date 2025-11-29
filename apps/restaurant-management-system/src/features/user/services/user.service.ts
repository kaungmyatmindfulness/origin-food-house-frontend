/**
 * User Service
 *
 * Service layer for user-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, unwrapApiResponseAs } from '@/utils/apiFetch';
import type {
  CreateUserDto,
  AddUserToStoreDto,
  UserProfileResponseDto,
} from '@repo/api/generated/types';
import type { CurrentUserData, UserStoreRole } from '../types/user.types';

/**
 * Registers a new user.
 *
 * @param userData - User registration details
 * @returns Registration response
 * @throws {ApiError} If the request fails
 */
export async function registerUser(
  userData: CreateUserDto
): Promise<UserProfileResponseDto> {
  const result = await apiClient.POST('/users/register', {
    body: userData,
  });

  return unwrapApiResponseAs<UserProfileResponseDto>(
    result,
    'Registration failed'
  );
}

/**
 * Assigns a user to a store with a specific role.
 *
 * @param userData - User, store, and role assignment details
 * @returns Assignment response
 * @throws {ApiError} If the request fails
 */
export async function addUserToStore(
  userData: AddUserToStoreDto
): Promise<unknown> {
  const result = await apiClient.POST('/users/add-to-store', {
    body: userData,
  });

  return unwrapApiResponseAs<unknown>(result, 'Add user to store failed');
}

/**
 * Retrieves the stores and roles for a specific user.
 *
 * @param userId - The user ID
 * @returns Array of user store role associations
 * @throws {ApiError} If the request fails
 */
export async function getUserStores(userId: string): Promise<UserStoreRole[]> {
  const result = await apiClient.GET('/users/{id}/stores', {
    params: { path: { id: userId } },
  });

  return unwrapApiResponseAs<UserStoreRole[]>(
    result,
    'Failed to get user stores'
  );
}

/**
 * Retrieves the profile of the currently authenticated user.
 *
 * @param storeId - Optional store ID to scope the user data
 * @returns Current user data
 * @throws {ApiError} If the request fails
 */
export async function getCurrentUser(
  storeId?: string
): Promise<CurrentUserData> {
  const result = await apiClient.GET('/users/me', {
    params: { query: { storeId } },
  });

  return unwrapApiResponseAs<CurrentUserData>(
    result,
    'Failed to get current user'
  );
}
