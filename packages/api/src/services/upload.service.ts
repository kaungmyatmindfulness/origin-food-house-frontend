import type { StandardApiResponse } from '../types/api.types.js';
import type { UploadImageResponseData } from '../types/upload.types.js';

const UPLOAD_IMAGE_ENDPOINT = '/upload/image';

/**
 * Creates upload service functions that use the provided apiFetch implementation.
 *
 * @param apiFetch - The configured apiFetch function from the app
 * @returns Upload service functions
 *
 * @example
 * ```typescript
 * // In your app
 * import { createUploadService } from '@repo/api/services/upload.service';
 * import { apiFetch } from '@/utils/apiFetch';
 *
 * const { uploadImage } = createUploadService(apiFetch);
 * ```
 */
export function createUploadService(
  apiFetch: <T>(
    path: string | { path: string; query?: Record<string, unknown> },
    options?: RequestInit
  ) => Promise<StandardApiResponse<T>>
) {
  return {
    uploadImage: async (file: File): Promise<UploadImageResponseData> => {
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiFetch<UploadImageResponseData>(
        UPLOAD_IMAGE_ENDPOINT,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.data?.basePath) {
        throw new Error('Base path is missing in the response');
      }

      return res.data;
    },
  };
}
