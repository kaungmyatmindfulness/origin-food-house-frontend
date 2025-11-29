/**
 * Typed Fetch Utility
 *
 * Provides type-safe fetch wrapper for endpoints not in the OpenAPI spec.
 * Returns properly typed responses without requiring type assertions in calling code.
 *
 * @example
 * ```ts
 * // GET request
 * const payment = await typedFetch<PaymentResponseDto>(
 *   '/payments/orders/123/payments'
 * );
 *
 * // POST request with body
 * const result = await typedFetch<PaymentResponseDto>(
 *   '/payments/orders/123/payments',
 *   {
 *     method: 'POST',
 *     body: { amount: 100, paymentMethod: 'CASH' },
 *   }
 * );
 * ```
 */

import { ApiError } from '@repo/api/utils/apiFetch';

import type { StandardApiResponse } from '@repo/api/types/api.types';

/** Options for typedFetch, extends RequestInit but handles body serialization */
export interface TypedFetchOptions extends Omit<RequestInit, 'body'> {
  /** Request body - will be JSON.stringify'd automatically */
  body?: unknown;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Makes a typed fetch request to an API endpoint.
 *
 * This utility is for endpoints NOT in the OpenAPI spec. Once endpoints are
 * added to the spec, services should migrate to using apiClient instead.
 *
 * @param path - API endpoint path (e.g., '/payments/orders/123/payments')
 * @param options - Fetch options including method, body, headers
 * @returns Typed response data
 * @throws {ApiError} If the request fails or response indicates error
 *
 * @example
 * ```ts
 * const payments = await typedFetch<PaymentResponseDto[]>(
 *   '/payments/orders/123/payments'
 * );
 * ```
 */
export async function typedFetch<T>(
  path: string,
  options: TypedFetchOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...restOptions,
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new ApiError(errorMessage, response.status);
  }

  const json: StandardApiResponse<T> = await response.json();

  if (json.status === 'error' || json.data === null) {
    throw new ApiError(json.message ?? 'Request failed', response.status, json);
  }

  return json.data;
}

/**
 * Makes a typed fetch request for unauthenticated endpoints.
 *
 * Used for auth endpoints that don't require an existing session.
 *
 * @param path - API endpoint path
 * @param options - Fetch options
 * @returns Typed response (raw JSON, not wrapped in StandardApiResponse)
 * @throws {ApiError} If the request fails
 */
export async function typedFetchUnauthenticated<T>(
  path: string,
  options: TypedFetchOptions = {}
): Promise<T> {
  const { body, headers, ...restOptions } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...restOptions,
  });

  if (!response.ok) {
    const errorMessage =
      response.status === 401
        ? 'Authentication failed'
        : `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}

/**
 * Makes a typed fetch request for FormData uploads.
 *
 * Does not set Content-Type header (browser sets it with boundary).
 *
 * @param path - API endpoint path
 * @param formData - FormData object to upload
 * @returns Typed response data
 * @throws {ApiError} If the request fails
 */
export async function typedFetchFormData<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response);
    throw new ApiError(errorMessage, response.status);
  }

  const json: StandardApiResponse<T> = await response.json();

  if (json.status === 'error' || json.data === null) {
    throw new ApiError(json.message ?? 'Upload failed', response.status, json);
  }

  return json.data;
}

/**
 * Extracts error message from response.
 */
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const json = await response.json();
    return json.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}
