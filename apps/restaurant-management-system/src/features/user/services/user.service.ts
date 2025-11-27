/**
 * User Service
 *
 * Service layer for user-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  CreateUserDto,
  AddUserToStoreDto,
  RegisterUserData,
  AddUserToStoreData,
  UserStoreRole,
  CurrentUserData,
} from '@/features/user/types/user.types';

/**
 * Register a new user.
 * Maps to: POST /users/register
 * @param userData - User registration details.
 * @returns A promise resolving to RegisterUserData (likely confirmation/basic user info).
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function registerUser(
  userData: CreateUserDto
): Promise<RegisterUserData> {
  const { data, error, response } = await apiClient.POST('/users/register', {
    body: userData,
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Registration failed',
      response.status
    );
  }

  return data.data as RegisterUserData;
}

/**
 * Assigns a user to a store with a specific role.
 * Maps to: POST /users/add-to-store
 * @param userData - Details of the user, store, and role assignment.
 * @returns A promise resolving to AddUserToStoreData (likely confirmation).
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function addUserToStore(
  userData: AddUserToStoreDto
): Promise<AddUserToStoreData> {
  const { data, error, response } = await apiClient.POST('/users/add-to-store', {
    body: userData,
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Add user to store failed',
      response.status
    );
  }

  return data.data as AddUserToStoreData;
}

/**
 * Retrieves the list of stores and roles for a specific user.
 * Maps to: GET /users/{id}/stores
 * @param userId - The ID of the user whose store memberships are requested.
 * @returns A promise resolving to an array of UserStoreRole objects.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function getUserStores(userId: string): Promise<UserStoreRole[]> {
  const { data, error, response } = await apiClient.GET('/users/{id}/stores', {
    params: { path: { id: userId } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to get user stores',
      response.status
    );
  }

  return data.data as UserStoreRole[];
}

/**
 * Retrieves the profile of the currently authenticated user.
 * Maps to: GET /users/me
 * @param storeId - Optional store ID to scope the user data
 * @returns A promise resolving to the CurrentUserData object.
 * @throws {ApiError} - Throws on fetch/API errors.
 */
export async function getCurrentUser(
  storeId?: string
): Promise<CurrentUserData> {
  const { data, error, response } = await apiClient.GET('/users/me', {
    params: { query: { storeId } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to get current user',
      response.status
    );
  }

  return data.data as CurrentUserData;
}
