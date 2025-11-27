/**
 * API Fetch Utilities
 *
 * This module provides error classes and response helpers for API operations.
 * The main API client is now provided by openapi-fetch in the client module.
 *
 * @deprecated For new code, use the typed client from @repo/api/client instead.
 * This module is kept for backward compatibility with existing service files.
 */

import type { ErrorDetail, StandardApiResponse } from '../types/api.types';

// Error classes for API operations
export class FetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export class NetworkError extends FetchError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends FetchError {
  public status: number;
  public errors: ErrorDetail[] | null;
  public responseJson: StandardApiResponse<unknown> | null;

  constructor(
    message: string,
    status: number,
    responseJson: StandardApiResponse<unknown> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.responseJson = responseJson;
    this.errors = responseJson?.errors ?? null;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    message: string = 'Unauthorized',
    responseJson: StandardApiResponse<unknown> | null = null
  ) {
    super(message, 401, responseJson);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Helper function to unwrap API response data with consistent null checking.
 * Throws an error if data is null.
 *
 * @param response - The API response object (can be from openapi-fetch or legacy format)
 * @param errorMessage - Custom error message if data is null
 * @returns The unwrapped data
 *
 * @example
 * ```typescript
 * // With openapi-fetch
 * const { data, error } = await client.GET('/stores/{storeId}/categories', { ... });
 * if (error) throw new ApiError(error.message, error.status);
 * return unwrapData({ data }, 'Failed to retrieve categories');
 *
 * // With legacy StandardApiResponse
 * const res = await apiFetch<Category[]>('/categories');
 * return unwrapData(res, 'Failed to retrieve categories');
 * ```
 */
export function unwrapData<T>(
  response: { data: T | null | undefined } | StandardApiResponse<T>,
  errorMessage: string
): T {
  // Handle both new format { data } and old format StandardApiResponse
  const data = 'status' in response ? response.data : response.data;

  if (data == null) {
    throw new Error(errorMessage);
  }
  return data;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is an UnauthorizedError
 */
export function isUnauthorizedError(
  error: unknown
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
