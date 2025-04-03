'use client';

import React from 'react';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from '@repo/ui/components/form';
import { useForm } from 'react-hook-form';
import { Input } from '@repo/ui/components/input';
import { Plus } from 'lucide-react';

interface CategoryFormFormData {
  name: string;
}
interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: CategoryFormFormData) => void;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormFormData>({ defaultValues: { name: '' } });

  function handleSubmit(values: CategoryFormFormData) {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
  }

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
