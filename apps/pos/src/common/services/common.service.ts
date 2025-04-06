import { apiFetch } from '@/utils/apiFetch';
import type { UploadImageResponseData } from '../types/upload.types';
const UPLOAD_IMAGE_ENDPOINT = '/upload/image';

export async function uploadImage(
  file: File
): Promise<UploadImageResponseData> {
  const formData = new FormData();

  formData.append('file', file);

  const res = await apiFetch<UploadImageResponseData>(UPLOAD_IMAGE_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!res.data?.imageUrl) {
    throw new Error('Image URL is missing in the response');
  }
  return res.data;
}
