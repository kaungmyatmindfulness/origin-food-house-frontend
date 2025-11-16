/**
 * Image upload response matching backend UploadImageResponseDto
 * Backend returns base S3 path without version suffix.
 * Frontend constructs full URLs using getImageUrl() utility.
 */
export type ImageSizeVersion = 'original' | 'small' | 'medium' | 'large';

export interface UploadImageResponseData {
  /** Base S3 path without version suffix (e.g., "uploads/abc-123-def") */
  basePath: string;
  /** Available image sizes generated for this upload */
  availableSizes: ImageSizeVersion[];
  /** Primary/default size for this preset (recommended size to display) */
  primarySize: ImageSizeVersion;
  /** Metadata about the uploaded image and its generated versions */
  metadata: {
    originalWidth?: number;
    originalHeight?: number;
    format?: string;
    originalSize: number;
    hasAlpha?: boolean;
    space?: string;
    versions: Partial<
      Record<
        ImageSizeVersion,
        {
          width?: number;
          height?: number;
          size?: number;
        }
      >
    >;
  };
}
