import { createUploadService } from '@repo/api/services/upload.service';
import { apiFetch } from '@/utils/apiFetch';

// Create upload service with configured apiFetch
const { uploadImage } = createUploadService(apiFetch);

// Re-export for backwards compatibility
export { uploadImage };
