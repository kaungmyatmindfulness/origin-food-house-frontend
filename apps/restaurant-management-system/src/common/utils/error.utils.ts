/**
 * Error Handling Utilities
 *
 * Provides type-safe utilities for extracting error messages from unknown error types.
 * Use these instead of unsafe type assertions like `error as unknown as { message?: string }`.
 */

/**
 * Safely extracts error message from unknown error type.
 * Use this instead of `error as unknown as { message?: string }`.
 *
 * Handles common error shapes:
 * - Error instances
 * - Objects with a message property
 * - Plain strings
 * - null/undefined values
 *
 * @param error - The unknown error value
 * @returns The error message string, or undefined if none could be extracted
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   toast.error('Operation failed', {
 *     description: getErrorMessage(error) ?? 'Unknown error',
 *   });
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string | undefined {
  if (error === null || error === undefined) {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    return typeof msg === 'string' ? msg : undefined;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
}
