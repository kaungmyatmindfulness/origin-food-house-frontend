/**
 * Common Service
 *
 * Re-exports common utilities for RMS app.
 * Uses openapi-fetch for type-safe API calls.
 */

import { ApiError } from '@/utils/apiFetch';

/** Image upload response data */
interface UploadImageResponseData {
  basePath: string;
  variants?: Record<string, string>;
}

/**
 * Uploads an image file to S3.
 * Note: Uses raw fetch since FormData uploads need special handling.
 *
 * @param file - Image file to upload
 * @returns Upload response with image paths
 * @throws {ApiError} If the request fails
 * @throws {Error} If base path is missing in response
 */
export async function uploadImage(file: File): Promise<UploadImageResponseData> {
  const formData = new FormData();
  formData.append('file', file);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${baseUrl}/upload/image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError('Failed to upload image', response.status);
  }

  const json = await response.json();

  if (!json.data?.basePath) {
    throw new Error('Base path is missing in the response');
  }

  return json.data as UploadImageResponseData;
}
