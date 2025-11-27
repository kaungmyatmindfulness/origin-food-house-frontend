/**
 * Common Service
 *
 * Re-exports common utilities for RMS app.
 */

import { ApiError } from '@/utils/apiFetch';
import type { UploadImageResponseData } from '@repo/api/types/upload.types';

/**
 * Uploads an image file to S3.
 * Note: This uses raw fetch since FormData uploads need special handling.
 */
export async function uploadImage(
  file: File
): Promise<UploadImageResponseData> {
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
