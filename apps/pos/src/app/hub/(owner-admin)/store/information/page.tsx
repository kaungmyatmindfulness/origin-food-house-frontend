'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

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

const updateStoreInformationSchema = z.object({
  name: z
    .string()
    .min(1, 'Store name is required.')
    .max(100, 'Store name too long.'),
  logoUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')), // Optional URL or empty string
  address: z.string().max(255, 'Address too long.').optional(),
  phone: z.string().max(20, 'Phone number too long.').optional(), // Add regex pattern if needed
  email: z
    .string()
    .email('Invalid email address.')
    .max(100)
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Must be a valid URL.')
    .max(255)
    .optional()
    .or(z.literal('')),
});

type UpdateStoreInformationFormData = z.infer<
  typeof updateStoreInformationSchema
>;

// Consistent query key
const storeDetailsQueryKey = (storeId: string | null) => [
  'storeDetails',
  storeId,
];

export default function UpdateStoreInformationPage() {
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
      console.log('Populating form with:', info);
      form.reset({
        name: info.name ?? '',
        logoUrl: info.logoUrl ?? '', // Assuming API returns logoUrl in information object
        address: info.address ?? '',
        phone: info.phone ?? '',
        email: info.email ?? '',
        website: info.website ?? '',
      });
    }
  }, [storeDetails, form.reset]); // form.reset is stable

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
      toast.success('Store information updated successfully!');
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
      toast.error('Cannot update: Store not selected.');
      return;
    }
    console.log('Submitting updated store info:', values);
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
        <p>Error loading store information.</p>
        {error instanceof Error && <p className="text-sm">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Store Information</h1>
        <p className="text-muted-foreground">
          Update your store's basic details and logo.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Manage your store's public information.
          </CardDescription>
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
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Store Name" {...field} />
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Main St, Anytown..."
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g., 081-234-5678"
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
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="info@yourstore.com"
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
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://yourstore.com"
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
                        label="Store Logo"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload your store's logo (e.g., PNG, JPG, WEBP).
                    </FormDescription>
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
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
