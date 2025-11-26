'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useTranslations } from 'next-intl';

import {
  getStoreDetails,
  updateStoreInformation,
} from '@/features/store/services/store.service'; // Adjust path

import type {
  GetStoreDetailsResponseDto,
  UpdateStoreInformationDto,
} from '@/features/store/types/store.types'; // Adjust path
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store'; // Adjust path
import { ImageUpload } from '@/common/components/widgets/image-upload'; // Adjust path
import type { ApiError } from '@/utils/apiFetch'; // Adjust path

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@repo/ui/components/card'; // Use Card for layout
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea'; // Use Textarea for address
import { Skeleton } from '@repo/ui/components/skeleton'; // For loading state

const createUpdateStoreInformationSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t('validation.nameRequired'))
      .max(100, t('validation.nameTooLong')),
    logoUrl: z
      .string()
      .url(t('validation.validUrl'))
      .optional()
      .or(z.literal('')), // Optional URL or empty string
    address: z.string().max(255, t('validation.addressTooLong')).optional(),
    phone: z.string().max(20, t('validation.phoneTooLong')).optional(), // Add regex pattern if needed
    email: z
      .string()
      .email(t('validation.invalidEmail'))
      .max(100)
      .optional()
      .or(z.literal('')),
    website: z
      .string()
      .url(t('validation.validUrl'))
      .max(255)
      .optional()
      .or(z.literal('')),
  });

type UpdateStoreInformationFormData = z.infer<
  ReturnType<typeof createUpdateStoreInformationSchema>
>;

// Consistent query key
const storeDetailsQueryKey = (storeId: string | null) => [
  'storeDetails',
  storeId,
];

export default function UpdateStoreInformationPage() {
  const t = useTranslations('store.info');
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId); // string | null

  // --- Fetch Current Store Data ---
  const {
    data: storeDetails,
    isLoading: isLoadingStore,
    isError,
    error,
  } = useQuery<GetStoreDetailsResponseDto | null, Error>({
    queryKey: storeDetailsQueryKey(selectedStoreId),
    queryFn: async () => {
      if (!selectedStoreId) return null;
      return getStoreDetails(selectedStoreId); // Fetch details using string ID
    },
    enabled: !!selectedStoreId, // Only run if storeId exists
    refetchOnWindowFocus: false,
  });

  // --- Form Setup ---
  const updateStoreInformationSchema = createUpdateStoreInformationSchema(t);
  const form = useForm<UpdateStoreInformationFormData>({
    resolver: zodResolver(updateStoreInformationSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
      address: '',
      phone: '',
      email: '',
      website: '',
    },
  });

  // --- Effect to Populate Form ---
  useEffect(() => {
    if (storeDetails?.information) {
      const info = storeDetails.information;
      form.reset({
        name: info.name ?? '',
        logoUrl: info.logoUrl ?? '', // Assuming API returns logoUrl in information object
        address: info.address ?? '',
        phone: info.phone ?? '',
        email: info.email ?? '',
        website: info.website ?? '',
      });
    }
  }, [storeDetails, form]);

  // --- Mutation for Updating Store Info ---
  const updateInfoMutation = useMutation<
    void, // updateStoreInformation returns void
    ApiError | Error,
    UpdateStoreInformationDto
  >({
    mutationFn: async (data: UpdateStoreInformationDto) => {
      if (!selectedStoreId) throw new Error('Store not selected');
      // Service expects (id, storeIdQuery, data)
      await updateStoreInformation(selectedStoreId, selectedStoreId, data);
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      // Invalidate the store details query to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: storeDetailsQueryKey(selectedStoreId),
      });
      // Optionally invalidate other queries if needed
    },
    onError: (error) => {
      console.error('Failed to update store information:', error);
      // Toast likely handled by apiFetch, but could add fallback
      // toast.error(`Update failed: ${error.message}`);
    },
  });

  // --- Form Submit Handler ---
  function onSubmit(values: UpdateStoreInformationFormData) {
    if (!selectedStoreId) {
      toast.error(t('cannotUpdate'));
      return;
    }
    // The 'values' object already matches UpdateStoreInformationDto structure
    updateInfoMutation.mutate(values);
  }

  // --- Render Logic ---

  if (isLoadingStore) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !storeDetails) {
    return (
      <div className="text-destructive p-6 text-center">
        <p>{t('errorLoading')}</p>
        {error instanceof Error && <p className="text-sm">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>{t('detailsTitle')}</CardTitle>
          <CardDescription>{t('detailsDescription')}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('storeNameLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('storeNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('addressLabel')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('addressPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phoneLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder={t('phonePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('emailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('emailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('websiteLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t('websitePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logoUrl" // Field name matches schema and DTO
                render={({ field }) => (
                  <FormItem>
                    {/* Label provided by ImageUpload component */}
                    <FormControl>
                      <ImageUpload
                        label={t('logoLabel')}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>{t('logoDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4 dark:border-gray-700">
              <Button
                type="submit"
                disabled={
                  updateInfoMutation.isPending || !form.formState.isDirty
                }
              >
                {updateInfoMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('saveChanges')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
