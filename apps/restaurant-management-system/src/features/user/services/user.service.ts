/**
 * User Service
 *
 * Service layer for user-related API operations.
 * Uses openapi-fetch for type-safe API calls with auto-generated types.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CreateUserDto,
  AddUserToStoreDto,
  UserProfileResponseDto,
} from '@repo/api/generated/types';
import type { CurrentUserData, UserStoreRole } from '../types/user.types';

/** Standard API response wrapper */
interface StandardApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

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
  const { data, error, response } = await apiClient.POST('/users/register', {
    body: userData,
  });

  const res = data as unknown as
    | StandardApiResponse<UserProfileResponseDto>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(res?.message || 'Registration failed', response.status);
  }

  return res.data;
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
  const { data, error, response } = await apiClient.POST(
    '/users/add-to-store',
    {
      body: userData,
    }
  );

  const res = data as unknown as StandardApiResponse<unknown> | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Add user to store failed',
      response.status
    );
  }

  return res.data;
}

/**
 * Retrieves the stores and roles for a specific user.
 *
 * @param userId - The user ID
 * @returns Array of user store role associations
 * @throws {ApiError} If the request fails
 */
export async function getUserStores(userId: string): Promise<UserStoreRole[]> {
  const { data, error, response } = await apiClient.GET('/users/{id}/stores', {
    params: { path: { id: userId } },
  });

  const res = data as unknown as
    | StandardApiResponse<UserStoreRole[]>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to get user stores',
      response.status
    );
  }

  return res.data;
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
  const { data, error, response } = await apiClient.GET('/users/me', {
    params: { query: { storeId } },
  });

  const res = data as unknown as
    | StandardApiResponse<CurrentUserData>
    | undefined;

  if (error || !res?.data) {
    throw new ApiError(
      res?.message || 'Failed to get current user',
      response.status
    );
  }

  return res.data;
}
