/**
 * Common error shape for failed API responses.
 */
export interface ApiError {
  code?: string; // e.g., "VALIDATION_ERROR", "BAD_REQUEST"
  message: string; // e.g., "Email is required"
}

/**
 * Common structure for successful/failed responses.
 * T is the data payload type (can be null if none).
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message: string | null;
  error: ApiError | null;
}
