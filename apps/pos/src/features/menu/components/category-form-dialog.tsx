'use client';

import { Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { createCategory } from '@/features/menu/services/category.service';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

  const mutateCreateCategory = useMutation({
    mutationFn: (data: CategoryFormFormData) =>
      createCategory(selectedStoreId!, data),
  });

  const handleSubmit = async (values: CategoryFormFormData) => {
    await mutateCreateCategory.mutateAsync(values);
    toast.success(`Category "${values.name}" created successfully!`);
    queryClient.invalidateQueries({
      queryKey: ['categories'],
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
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          Create Category
        </Button>
      </DialogTrigger>
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
