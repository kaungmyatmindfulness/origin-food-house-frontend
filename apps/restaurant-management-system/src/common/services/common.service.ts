/**
 * Common Service
 *
 * Re-exports common utilities for RMS app.
 * Uses typedFetch for FormData uploads.
 */

import { typedFetchFormData } from '@/utils/typed-fetch';

/** Image upload response data */
interface UploadImageResponseData {
  basePath: string;
  variants?: Record<string, string>;
}

/**
 * Uploads an image file to S3.
 * Note: Uses typedFetchFormData since FormData uploads need special handling.
 *
 * @param file - Image file to upload
 * @returns Upload response with image paths
 * @throws {ApiError} If the request fails
 * @throws {Error} If base path is missing in response
 */
export async function uploadImage(
  file: File
): Promise<UploadImageResponseData> {
  const formData = new FormData();
  formData.append('file', file);

  const data = await typedFetchFormData<UploadImageResponseData>(
    '/upload/image',
    formData
  );

  if (!data.basePath) {
    throw new Error('Base path is missing in the response');
  }

  return data;
}
