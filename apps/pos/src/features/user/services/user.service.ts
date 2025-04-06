import {
  CreateUserDto,
  AddUserToStoreDto,
  RegisterUserData,
  AddUserToStoreData,
  UserStoreRole,
  CurrentUserData,
} from '@/features/user/types/user.types'; // Adjust path as needed
import { apiFetch } from '@/utils/apiFetch'; // Assuming improved apiFetch exists here

/**
 * Register a new user.
 * Maps to: POST /users/register
 * @param data - User registration details.
 * @returns A promise resolving to RegisterUserData (likely confirmation/basic user info).
 * @throws {NetworkError | ApiError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function registerUser(
  data: CreateUserDto
): Promise<RegisterUserData> {
  // apiFetch handles errors (network, http status, api status: 'error') and returns BaseApiResponse<T>
  const res = await apiFetch<RegisterUserData>('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // If apiFetch succeeded, check for data existence
  if (!res.data) {
    console.error('API Error: registerUser succeeded but returned null data.');
    throw new Error('Registration failed: No data returned by API.');
  }
  return res.data;
}

/**
 * Assigns a user to a store with a specific role.
 * Maps to: POST /users/add-to-store
 * @param data - Details of the user, store, and role assignment.
 * @returns A promise resolving to AddUserToStoreData (likely confirmation).
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function addUserToStore(
  data: AddUserToStoreDto
): Promise<AddUserToStoreData> {
  // apiFetch handles errors
  const res = await apiFetch<AddUserToStoreData>('/users/add-to-store', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // If apiFetch succeeded, check for data existence
  if (!res.data) {
    console.error(
      'API Error: addUserToStore succeeded but returned null data.'
    );
    throw new Error('Add user to store failed: No data returned by API.');
  }
  return res.data;
}

/**
 * Retrieves the list of stores and roles for a specific user.
 * Maps to: GET /users/{id}/stores
 * @param userId - The ID of the user whose store memberships are requested.
 * @returns A promise resolving to an array of UserStoreRole objects.
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function getUserStores(userId: number): Promise<UserStoreRole[]> {
  // apiFetch handles errors
  const res = await apiFetch<UserStoreRole[]>(`/users/${userId}/stores`);

  // If apiFetch succeeded, check for data existence.
  // Note: An empty array [] is valid data, but null/undefined usually indicates an issue.
  if (res.data == null) {
    // Check for null or undefined specifically
    console.error(
      `API Error: getUserStores(${userId}) succeeded but returned null/undefined data.`
    );
    throw new Error('Failed to get user stores: No data returned by API.');
  }
  return res.data;
}

/**
 * Retrieves the profile of the currently authenticated user.
 * Maps to: GET /users/me
 * @returns A promise resolving to the CurrentUserData object.
 * @throws {NetworkError | ApiError | UnauthorizedError} - Throws on fetch/API errors. Throws Error if data is null on success.
 */
export async function getCurrentUser(): Promise<CurrentUserData> {
  // apiFetch handles errors
  const res = await apiFetch<CurrentUserData>('/users/me');

  // If apiFetch succeeded, check for data existence
  if (!res.data) {
    console.error(
      'API Error: getCurrentUser succeeded but returned null data.'
    );
    throw new Error('Failed to get current user: No data returned by API.');
  }
  return res.data;
}
