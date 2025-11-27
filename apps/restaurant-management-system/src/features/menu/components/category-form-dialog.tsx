'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/lib/toast';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';

interface CategoryFormFormData {
  name: string;
}
interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
}: CategoryFormDialogProps) {
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const form = useForm<CategoryFormFormData>({ defaultValues: { name: '' } });

  // Use $api.useMutation for type-safe mutations
  const createCategoryMutation = $api.useMutation('post', API_PATHS.categories);

  const handleSubmit = async (values: CategoryFormFormData) => {
    await createCategoryMutation.mutateAsync({
      params: { path: { storeId: selectedStoreId! } },
      body: values,
    });
    toast.success(`Category "${values.name}" created successfully!`);
    queryClient.invalidateQueries({
      queryKey: ['get', API_PATHS.categories],
    });
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>Enter new category name.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
