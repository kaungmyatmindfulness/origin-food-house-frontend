/**
 * Common error shape for failed API responses.
 */
export interface ErrorDetail {
  code?: string; // e.g., "VALIDATION_ERROR", "BAD_REQUEST"
  message: string; // e.g., "Email is required"
  field?: string | null; // e.g., "email"
}

/**
 * Common structure for successful/failed responses.
 * T is the data payload type (can be null if none).
 */
export interface StandardApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message: string | null;
  errors: ErrorDetail[] | null;
}
