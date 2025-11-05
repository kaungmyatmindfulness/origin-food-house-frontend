'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { toast } from '@repo/ui/lib/toast';
import { useUploadPaymentProof } from '../../hooks/useSubscription';
import { cn } from '@repo/ui/lib/utils';

interface UploadProofStepProps {
  paymentRequestId: string;
  onSuccess: () => void;
}

export function UploadProofStep({
  paymentRequestId,
  onSuccess,
}: UploadProofStepProps) {
  const t = useTranslations('subscription.upgrade');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const uploadProof = useUploadPaymentProof();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(t('errors.fileTooLarge'));
          return;
        }
        setSelectedFile(file);
      }
    },
    [t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadProof.mutateAsync({
        paymentRequestId,
        file: selectedFile,
      });
      onSuccess();
    } catch {
      toast.error(t('errors.uploadFailed'));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-4 text-sm">
        <p className="font-medium">{t('uploadInstructions')}</p>
        <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
          <li>{t('uploadNote1')}</li>
          <li>{t('uploadNote2')}</li>
          <li>{t('uploadNote3')}</li>
        </ul>
      </div>

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            !isDragActive && 'border-border hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="text-muted-foreground mx-auto h-12 w-12" />
          {isDragActive ? (
            <p className="mt-4 font-medium">{t('dropHere')}</p>
          ) : (
            <div className="mt-4">
              <p className="font-medium">{t('dropOrClick')}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {t('acceptedFormats')}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t('maxSize')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={uploadProof.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadProof.isPending}
        >
          {uploadProof.isPending ? t('uploading') : t('submit')}
        </Button>
      </div>
    </div>
  );
}
