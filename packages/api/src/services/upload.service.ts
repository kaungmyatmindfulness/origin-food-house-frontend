/**
 * Upload Service
 *
 * Service functions for file upload operations.
 * Note: FormData uploads use raw fetch since openapi-fetch doesn't handle multipart well.
 */

import type { UploadImageResponseData } from '../types/upload.types';
import { ApiError } from '../utils/apiFetch';

const UPLOAD_IMAGE_ENDPOINT = '/upload/image';

/**
 * Creates upload service functions that use the provided base URL.
 *
 * @param baseUrl - The API base URL
 * @returns Upload service functions
 *
 * @example
 * ```typescript
 * import { createUploadService } from '@repo/api/services/upload.service';
 *
 * const baseUrl = process.env.NEXT_PUBLIC_API_URL;
 * const { uploadImage } = createUploadService(baseUrl);
 * ```
 */
export function createUploadService(baseUrl: string) {
  return {
    /**
     * Uploads an image file.
     *
     * @param file - Image file to upload
     * @returns Upload response with image paths
     * @throws {ApiError} If the request fails
     * @throws {Error} If base path is missing in response
     */
    uploadImage: async (file: File): Promise<UploadImageResponseData> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${baseUrl}${UPLOAD_IMAGE_ENDPOINT}`, {
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
    },
  };
}
