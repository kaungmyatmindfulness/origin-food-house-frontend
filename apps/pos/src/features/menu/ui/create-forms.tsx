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
import { Textarea } from '@repo/ui/components/textarea';
import { Plus } from 'lucide-react';

interface CreateItemFormData {
  name: string;
  description: string;
  price: number;
}
interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: CreateItemFormData) => void;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateItemDialogProps) {
  const form = useForm<CreateItemFormData>({
    defaultValues: { name: '', description: '', price: 0 },
  });

  function handleSubmit(values: CreateItemFormData) {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          Create Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Menu Item</DialogTitle>
          <DialogDescription>Fill out item details below.</DialogDescription>
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
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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

interface CreateCategoryFormData {
  name: string;
}
interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: CreateCategoryFormData) => void;
}

export function CreateCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateCategoryDialogProps) {
  const form = useForm<CreateCategoryFormData>({ defaultValues: { name: '' } });

  function handleSubmit(values: CreateCategoryFormData) {
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
