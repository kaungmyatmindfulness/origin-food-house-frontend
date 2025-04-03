'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { Separator } from '@repo/ui/components/separator';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Input } from '@repo/ui/components/input';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@repo/ui/components/tooltip';

import Dropzone, { DropzoneState } from 'react-dropzone';
import { cn } from '@repo/ui/lib/utils';
import { Combobox } from '@repo/ui/components/combobox';

/** Represents a single Variation row. */
export interface VariationData {
  name: string;
  additionalPrice: number;
}

/** Represents a single Add-On row. */
export interface AddOnData {
  name: string;
  additionalPrice: number;
}

/**
 * Zod schema for the entire menu item form:
 * - "title": 1–70 chars
 * - "description": 1–255 chars
 * - "imageKey": optional S3 path
 * - "categoryId": from Combobox
 * - "newCategoryName": used if "add_new" is chosen
 * - "variations": dynamic array
 * - "mustChooseVariation": boolean
 * - "addOns": dynamic array
 * - "minAddOns", "maxAddOns"
 * - "isVisible": final checkbox
 */
const menuItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(70),
  description: z.string().min(1, 'Description is required').max(255),
  imageKey: z.string().optional(),
  categoryId: z.string().optional(),
  newCategoryName: z
    .string()
    .max(70, 'Max 70 chars')
    .optional()
    .refine(
      (val) => !val || val.trim().length > 0,
      'Category name cannot be empty'
    ),
  isNewCategory: z.boolean().default(false),

  variations: z
    .array(
      z.object({
        name: z
          .string()
          .max(70, 'Max 70 chars')
          .nonempty('Variation name required'),
        additionalPrice: z.number().min(0, 'Must be >= 0'),
      })
    )
    .optional(),
  mustChooseVariation: z.boolean().default(false),

  addOns: z
    .array(
      z.object({
        name: z
          .string()
          .max(70, 'Max 70 chars')
          .nonempty('Add-on name required'),
        additionalPrice: z.number().min(0, 'Must be >= 0'),
      })
    )
    .optional(),

  minAddOns: z.number().min(0).default(0),
  maxAddOns: z.number().min(0).default(0),

  isVisible: z.boolean().default(true),
});

/** Final typed shape after zod parse. */
export type MenuItemFormData = z.infer<typeof menuItemSchema>;

/** Available modes for the form dialog. */
export type MenuFormMode = 'create' | 'edit';

/** Props for the MenuItemFormDialog. */
export interface MenuItemFormDialogProps {
  mode: MenuFormMode;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: MenuItemFormData) => void;
  /** initialValues for "edit" mode if desired. */
  initialValues?: Partial<MenuItemFormData>;
}

/**
 * MenuItemFormDialog:
 * A single form supporting create or edit mode.
 * Uses Shadcn UI + react-hook-form + zod.
 */
export function MenuItemFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: MenuItemFormDialogProps) {
  // Local UI states for image uploading.
  const [uploadLoading, setUploadLoading] = useState(false);
  const [localFilePreview, setLocalFilePreview] = useState<string>('');

  // React Hook Form setup.
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      title: '',
      description: '',
      imageKey: '',
      categoryId: '',
      newCategoryName: '',
      isNewCategory: false,
      variations: [],
      mustChooseVariation: false,
      addOns: [],
      minAddOns: 0,
      maxAddOns: 0,
      isVisible: true,
      ...initialValues,
    },
  });

  // Manage dynamic arrays for "variations" and "addOns."
  const {
    fields: variationFields,
    append: appendVariation,
    remove: removeVariation,
  } = useFieldArray({ control: form.control, name: 'variations' });

  const {
    fields: addOnFields,
    append: appendAddOn,
    remove: removeAddOn,
  } = useFieldArray({ control: form.control, name: 'addOns' });

  // Watch + clamp for the addOns min/max logic.
  const addOnsCount = form.watch('addOns')?.length || 0;
  const minAddOns = form.watch('minAddOns');
  const maxAddOns = form.watch('maxAddOns');

  useEffect(() => {
    // minAddOns <= addOnsCount
    if (minAddOns > addOnsCount) {
      form.setValue('minAddOns', addOnsCount);
    }
    // maxAddOns >= minAddOns and <= addOnsCount
    if (maxAddOns < minAddOns) {
      form.setValue('maxAddOns', minAddOns);
    }
    if (maxAddOns > addOnsCount) {
      form.setValue('maxAddOns', addOnsCount);
    }
  }, [minAddOns, maxAddOns, addOnsCount, form]);

  // If user picks "Add New Category" in the combobox, set isNewCategory = true, else false.
  const watchCategoryId = form.watch('categoryId');
  useEffect(() => {
    if (watchCategoryId === 'add_new') {
      form.setValue('isNewCategory', true);
    } else {
      form.setValue('isNewCategory', false);
      form.setValue('newCategoryName', '');
    }
  }, [watchCategoryId, form]);

  // React Dropzone: handle file selection + mock S3 upload.
  function handleDrop(acceptedFiles: File[]) {
    if (!acceptedFiles?.length) return;
    const file = acceptedFiles[0];
    setUploadLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLocalFilePreview(dataUrl);
      // Simulate S3 upload with setTimeout.
      setTimeout(() => {
        form.setValue('imageKey', 'uploads/myImage123.png');
        setUploadLoading(false);
      }, 1200);
    };
    reader.readAsDataURL(file!);
  }

  function handleRemoveImage() {
    setLocalFilePreview('');
    form.setValue('imageKey', '');
  }

  // Called on "Submit" button.
  function handleSubmit(values: MenuItemFormData) {
    onSubmit(values);
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center">
          {mode === 'create' ? (
            <>
              <Plus className="mr-1 h-4 w-4" />
              Create Menu Item
            </>
          ) : (
            'Edit Menu Item'
          )}
        </Button>
      </DialogTrigger>

      {/* 
        max-h-[80dvh] ensures the dialog content
        doesn't exceed 80% of the viewport height.
        overflow-y-auto -> scroll if needed.
      */}
      <DialogContent className="max-h-[80dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill out item details below.'
              : 'Update item details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spicy Chicken Wings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description (max 255)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            {/* Image (Dropzone) */}
            <div>
              <FormLabel>Upload Image</FormLabel>
              {uploadLoading ? (
                <p className="text-sm">Uploading... please wait.</p>
              ) : localFilePreview ? (
                <div className="relative mt-2 h-32 w-32 overflow-hidden rounded border">
                  <img
                    src={localFilePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 flex items-center rounded bg-white p-1 text-sm shadow"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ) : (
                <Dropzone
                  onDrop={handleDrop}
                  accept={{ 'image/png': [], 'image/jpeg': [] }}
                >
                  {(state: DropzoneState) => (
                    <div
                      {...state.getRootProps()}
                      className={cn(
                        'mt-2 flex h-32 w-full cursor-pointer items-center justify-center rounded border border-dashed p-2 text-sm hover:bg-gray-50',
                        state.isDragActive && 'bg-gray-100'
                      )}
                    >
                      <input {...state.getInputProps()} />
                      <Upload className="mr-1 h-4 w-4 text-gray-500" />
                      Drop files here or click to upload (JPG/PNG)
                    </div>
                  )}
                </Dropzone>
              )}

              {/* If we have a final s3 key, show it */}
              {form.watch('imageKey') && (
                <p className="mt-1 text-xs text-gray-600">
                  S3 Key: {form.watch('imageKey')}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Category using Combobox */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Combobox
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      placeholder="Select a category"
                      items={[
                        { label: 'Main Dishes', value: '1' },
                        { label: 'Beverages', value: '2' },
                        { label: 'Desserts', value: '3' },
                        { label: 'Add New Category', value: 'add_new' },
                      ]}
                      searchable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* If user picks "Add New Category," show newCategoryName */}
            {form.watch('isNewCategory') && (
              <FormField
                control={form.control}
                name="newCategoryName"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel>New Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Vegan Special" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator className="my-4" />

            {/* Variations */}
            <div className="space-y-2">
              <FormLabel>Variations</FormLabel>
              <p className="text-xs text-gray-500">
                A Variation is an option (e.g., size/flavor) that can have an
                additional cost.
              </p>

              {variationFields.map((vf, index) => (
                <div
                  key={vf.id}
                  className="mb-2 flex items-center gap-2 rounded bg-gray-50 p-2"
                >
                  {/* Variation Name */}
                  <FormField
                    control={form.control}
                    name={`variations.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Variation name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Variation Price */}
                  <FormField
                    control={form.control}
                    name={`variations.${index}.additionalPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="w-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeVariation(index)}
                    title="Remove variation"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendVariation({ name: '', additionalPrice: 0 })
                }
              >
                + Add Variation
              </Button>

              {/* "Must Choose Variation" at end */}
              <FormField
                control={form.control}
                name="mustChooseVariation"
                render={({ field }) => (
                  <FormItem className="mt-2 flex items-center gap-2">
                    <FormLabel>Required?</FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(val) => field.onChange(val === true)}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Customer must select a single variation when ordering.
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            {/* Add-Ons */}
            <div className="space-y-2">
              <FormLabel>Add-Ons</FormLabel>
              <p className="text-xs text-gray-500">
                Add-ons are optional extras with a name and price.
              </p>

              {addOnFields.map((af, index) => (
                <div
                  key={af.id}
                  className="mb-2 flex items-center gap-2 rounded bg-gray-50 p-2"
                >
                  {/* Add-On Name */}
                  <FormField
                    control={form.control}
                    name={`addOns.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Add-on name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Add-On Price */}
                  <FormField
                    control={form.control}
                    name={`addOns.${index}.additionalPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className="w-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeAddOn(index)}
                    title="Remove add-on"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendAddOn({ name: '', additionalPrice: 0 })}
              >
                + Add Add-On
              </Button>

              {/* minAddOns, maxAddOns */}
              <div className="mt-3 flex items-center gap-4">
                {/* Min */}
                <FormField
                  control={form.control}
                  name="minAddOns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1">
                        <FormLabel>Min Add-Ons</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-gray-400 hover:underline">
                              [?]
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            The minimum number of add-ons the customer must
                            pick.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input type="number" {...field} className="w-16" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Max */}
                <FormField
                  control={form.control}
                  name="maxAddOns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-1">
                        <FormLabel>Max Add-Ons</FormLabel>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-gray-400 hover:underline">
                              [?]
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            The maximum number of add-ons the customer can pick.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <FormControl>
                        <Input type="number" {...field} className="w-16" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Is Visible */}
            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex items-start gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => field.onChange(val === true)}
                    />
                  </FormControl>
                  <div>
                    <FormLabel>Is Visible?</FormLabel>
                    <p className="text-xs text-gray-500">
                      If out of stock or inactive, uncheck to hide from
                      customers.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                {mode === 'create' ? 'Create' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
