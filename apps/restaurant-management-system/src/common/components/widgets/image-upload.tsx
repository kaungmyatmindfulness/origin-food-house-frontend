'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from '@repo/ui/lib/toast';
import { useMutation } from '@tanstack/react-query';
import { getImageUrl } from '@repo/api/utils/s3-url';

import { cn } from '@repo/ui/lib/utils';
import { uploadImage } from '@/common/services/common.service';

interface ImageUploadProps {
  /** The current image identifier (e.g., S3 key/path) or undefined */
  value?: string;
  /** Function called when the image identifier changes (set or cleared) */
  onChange: (identifier: string | undefined) => void;
  /** Optional label */
  label?: string;
  /** Max file size in bytes (default: 2MB) */
  maxSize?: number;
  /** Accepted file types (default: JPG/JPEG/PNG/WEBP based on updated spec) */
  accept?: Record<string, string[]>;
  /** Disabled state */
  disabled?: boolean;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB;

const DEFAULT_ACCEPT = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
  });

  const generatePreview = useCallback(
    (file: File) => {
      if (preview?.startsWith('data:')) {
        URL.revokeObjectURL(preview);
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.onerror = () => {
        console.error('Error reading file for preview');
        toast.error("Couldn't generate image preview.");
        setPreview(null);
      };
      reader.readAsDataURL(file);
    },
    [preview]
  );

  useEffect(() => {
    if (!value) {
      setPreview(null);
    }

    const currentPreview = preview;
    return () => {
      if (currentPreview?.startsWith('data:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [value, preview]);

  const handleDropAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      generatePreview(file);
      setIsLoading(true);

      try {
        const { basePath } = await uploadImageMutation.mutateAsync(file);

        onChange(basePath);
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        const errorMsg =
          uploadError instanceof Error
            ? uploadError.message
            : 'Image upload failed.';
        setError(`Upload failed: ${errorMsg.substring(0, 100)}`);

        toast.error(`Upload failed: ${errorMsg}`);
        setPreview(null);
        onChange(undefined);
      } finally {
        setIsLoading(false);
      }
    },
    [generatePreview, onChange, uploadImageMutation]
  );

  const handleDropRejected = useCallback(
    (rejectedFiles: FileRejection[]) => {
      const firstError = rejectedFiles[0]?.errors[0];
      let message = 'File rejected.';
      if (firstError) {
        if (firstError.code === 'file-too-large') {
          message = `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB).`;
        } else if (firstError.code === 'file-invalid-type') {
          message = 'Invalid file type.';
        } else {
          message = firstError.message;
        }
      }
      setError(message);
      toast.error(message);
    },
    [maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted: handleDropAccepted,
    onDropRejected: handleDropRejected,
    accept,
    maxSize,
    multiple: false,
    disabled: isLoading || disabled,
  });

  const handleRemove = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (preview?.startsWith('data:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    onChange(undefined);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center py-4 text-gray-500">
          <Loader2 className="mb-2 h-8 w-8 animate-spin" />
          <span>Uploading...</span>
        </div>
      );
    }

    if (preview) {
      return (
        <div className="group relative h-32 w-32">
          {' '}
          {/* Added group for potential hover effects */}
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full rounded object-cover"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 text-sm opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Remove image"
              title="Remove image"
              disabled={isLoading || disabled}
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      );
    }

    if (value) {
      const displayUrl = getImageUrl(value, 'medium');

      return (
        <div className="group relative h-32 w-32">
          {/* Attempt to display the image using the constructed URL from basePath */}
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={value.split('/').pop() || 'Uploaded image'}
              width={128}
              height={128}
              className="h-full w-full rounded object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded bg-gray-100 text-center text-gray-500 dark:bg-gray-700">
              <ImageIcon className="mb-1 h-10 w-10 text-gray-400" />
              <span className="text-xs break-all">
                {value.split('/').pop()}
              </span>
            </div>
          )}
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white p-1 text-sm opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-gray-100 disabled:opacity-50"
              aria-label="Remove image"
              title="Remove image"
              disabled={isLoading || disabled}
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-gray-600 dark:text-gray-400">
        <Upload className="mb-2 h-8 w-8 text-gray-400" />
        <span>Drop image here, or click</span>
        <span className="mt-1 text-xs">
          (Max {Math.round(maxSize / 1024 / 1024)}MB)
        </span>
      </div>
    );
  };

  return (
    <div>
      {/* Optional Label */}
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {/* Dropzone Container */}
      <div
        {...getRootProps()}
        className={cn(
          'relative mt-1 transition-colors duration-200 ease-in-out',

          !preview &&
            !value &&
            !isLoading &&
            'flex h-32 w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-4',

          (preview || value) &&
            !isLoading &&
            'inline-block h-auto w-auto border-0 p-0',

          'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
          isDragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-900/30',
          (isLoading || disabled) && 'cursor-not-allowed opacity-60',

          (isLoading || disabled) &&
            !preview &&
            !value &&
            'bg-gray-100 dark:bg-gray-800',
          error && 'border-red-500',

          error &&
            !preview &&
            !value &&
            !isLoading &&
            'bg-red-50 dark:bg-red-900/30'
        )}
      >
        <input {...getInputProps()} disabled={isLoading || disabled} />
        {renderContent()}
      </div>
      {/* Error Message Display */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
