'use client';

import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@repo/ui/lib/toast';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from '@/utils/apiFetch';
import Image from 'next/image';

interface BrandingTabProps {
  storeId: string;
  currentLogoUrl?: string | null;
  currentCoverUrl?: string | null;
  onSuccess?: () => void;
}

export function BrandingTab({
  storeId,
  currentLogoUrl,
  currentCoverUrl,
  onSuccess,
}: BrandingTabProps) {
  const t = useTranslations('store.settingsPage.branding');
  const queryClient = useQueryClient();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const uploadMutation = useMutation<unknown, ApiError | Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const accessToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('accessToken='))
        ?.split('=')[1];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stores/${storeId}/settings/branding`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to upload branding assets');
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success(t('uploadSuccess'));
      queryClient.invalidateQueries({ queryKey: ['storeDetails', storeId] });
      // Clear previews and files
      setLogoPreview(null);
      setCoverPreview(null);
      setLogoFile(null);
      setCoverFile(null);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Failed to upload branding:', error);
      toast.error(t('uploadError'));
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('fileTooLarge'));
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('fileTooLarge'));
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!logoFile && !coverFile) {
      toast.error(t('noFilesSelected'));
      return;
    }

    const formData = new FormData();
    if (logoFile) formData.append('logo', logoFile);
    if (coverFile) formData.append('cover', coverFile);

    uploadMutation.mutate(formData);
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const hasChanges = logoFile !== null || coverFile !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Section */}
        <div>
          <h4 className="mb-2 font-medium">{t('logo')}</h4>
          <p className="text-muted-foreground mb-4 text-sm">
            {t('logoDescription')}
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            {/* Preview */}
            <div className="bg-muted flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed">
              {logoPreview || currentLogoUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={logoPreview || currentLogoUrl || ''}
                    alt="Logo preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <ImageIcon className="text-muted-foreground h-12 w-12" />
              )}
            </div>
            {/* Upload Controls */}
            <div className="flex flex-col gap-2">
              <label htmlFor="logo-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadMutation.isPending}
                  onClick={() =>
                    document.getElementById('logo-upload')?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadLogo')}
                </Button>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
              {logoFile && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {logoFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearLogo}
                    disabled={uploadMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover Photo Section */}
        <div>
          <h4 className="mb-2 font-medium">{t('cover')}</h4>
          <p className="text-muted-foreground mb-4 text-sm">
            {t('coverDescription')}
          </p>
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-muted flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed">
              {coverPreview || currentCoverUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={coverPreview || currentCoverUrl || ''}
                    alt="Cover preview"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <ImageIcon className="text-muted-foreground h-16 w-16" />
              )}
            </div>
            {/* Upload Controls */}
            <div className="flex flex-col gap-2">
              <label htmlFor="cover-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadMutation.isPending}
                  onClick={() =>
                    document.getElementById('cover-upload')?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadCover')}
                </Button>
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverFile && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {coverFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearCover}
                    disabled={uploadMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-end border-t pt-4">
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !hasChanges}
          >
            {uploadMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
