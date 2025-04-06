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
import { ImageUpload } from '@/common/components/widgets/image-upload';

/**
 * Zod schema for the new menu item form structure.
 */
const menuItemSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(70),
    description: z.string().min(1, 'Description is required').max(255),
    basePrice: z
      .number({ invalid_type_error: 'Base price required' })
      .min(0, 'Must be >= 0'),
    imageKey: z.string().optional(),

    categoryId: z.string().optional(),
    newCategoryName: z
      .string()
      .max(70, 'Max 70 chars')
      .optional()
      .refine(
        (val) => !val || val.trim().length > 0,
        'Category name cannot be empty if provided'
      ),
    isNewCategory: z.boolean().default(false),

    customizationGroups: z
      .array(
        z.object({
          name: z
            .string()
            .max(70, 'Max 70 chars')
            .nonempty('Group name required'),
          required: z.boolean().default(false),
          minSelectable: z.number().min(0).default(0),
          maxSelectable: z.number().min(0).default(1),
          options: z
            .array(
              z.object({
                name: z
                  .string()
                  .max(70, 'Max 70 chars')
                  .nonempty('Option name required'),
                additionalPrice: z.number().min(0, 'Must be >= 0'),
              })
            )
            .min(1, 'At least one option is required per group'),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.categoryId === 'add_new') {
        return !!data.newCategoryName?.trim();
      }

      if (!data.isNewCategory) {
        return !!data.categoryId && data.categoryId !== 'add_new';
      }
      return true;
    },
    {
      message: 'Please select a category or enter a name for the new one.',
      path: ['categoryId'],
    }
  )
  .refine(
    (data) => {
      return (
        data.customizationGroups?.every(
          (group) =>
            group.minSelectable <= group.maxSelectable &&
            group.maxSelectable <= group.options.length
        ) ?? true
      );
    },
    {
      message:
        'Min/Max Selectable constraint violated for a group (Min <= Max <= Options Count)',

      path: ['customizationGroups'],
    }
  );

/** Final typed shape after zod parse (for form state). */
export type MenuItemFormData = z.infer<typeof menuItemSchema>;

/** Type for the data passed to the onSubmit prop (matching the *new* DTO). */
export interface SubmitMenuItemData {
  name: string;
  description: string;
  basePrice: number;
  imageKey?: string;
  category: { id?: number; name: string };
  customizationGroups: Array<{
    name: string;
    required: boolean;
    minSelectable: number;
    maxSelectable: number;
    options: Array<{
      name: string;
      additionalPrice: number;
    }>;
  }>;
}

/** Available modes for the form dialog. */
export type MenuFormMode = 'create' | 'edit';

/** Mock Category Data Type for Combobox */
interface CategoryOption {
  label: string;
  value: string;
}

const MOCK_CATEGORIES: CategoryOption[] = [
  { label: 'Main Dishes', value: '1' },
  { label: 'Beverages', value: '2' },
  { label: 'Desserts', value: '3' },
];

/** Props for the MenuItemFormDialog. */
export interface MenuItemFormDialogProps {
  mode: MenuFormMode;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSubmit: (data: SubmitMenuItemData) => void;
  /** initialValues for "edit" mode if desired (should match NEW DTO structure). */
  initialValues?: Partial<SubmitMenuItemData>;
}

/**
 * MenuItemFormDialog:
 * A single form supporting create or edit mode for the NEW DTO.
 * Uses Shadcn UI + react-hook-form + zod.
 */
export function MenuItemFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}: MenuItemFormDialogProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [localFilePreview, setLocalFilePreview] = useState<string>('');
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([
    ...MOCK_CATEGORIES,
    { label: 'Add New Category', value: 'add_new' },
  ]);

  const mapInitialValuesToFormData = (
    initial?: Partial<SubmitMenuItemData>
  ): Partial<MenuItemFormData> => {
    if (!initial) return {};
    return {
      name: initial.name,
      description: initial.description,
      basePrice: initial.basePrice,
      imageKey: initial.imageKey,

      categoryId: initial.category?.id
        ? String(initial.category.id)
        : undefined,

      newCategoryName: '',
      isNewCategory: false,

      customizationGroups: initial.customizationGroups?.map((group) => ({
        name: group.name,
        required: group.required,
        minSelectable: group.minSelectable,
        maxSelectable: group.maxSelectable,
        options: group.options.map((opt) => ({
          name: opt.name,
          additionalPrice: opt.additionalPrice,
        })),
      })),
    };
  };

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      imageKey: '',
      categoryId: '',
      newCategoryName: '',
      isNewCategory: false,
      customizationGroups: [],
      ...mapInitialValuesToFormData(initialValues),
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(mapInitialValuesToFormData(initialValues));

      setLocalFilePreview('');
    } else {
      form.reset({
        name: '',
        description: '',
        basePrice: 0,
        imageKey: '',
        categoryId: '',
        newCategoryName: '',
        isNewCategory: false,
        customizationGroups: [],
      });
      setLocalFilePreview('');
    }
  }, [initialValues, form.reset]);

  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({ control: form.control, name: 'customizationGroups' });

  const watchCategoryId = form.watch('categoryId');
  useEffect(() => {
    form.setValue('isNewCategory', watchCategoryId === 'add_new');
    if (watchCategoryId !== 'add_new') {
      form.setValue('newCategoryName', '');
    }
  }, [watchCategoryId, form]);

  const watchedGroups = form.watch('customizationGroups');

  useEffect(() => {
    watchedGroups?.forEach((group, groupIndex) => {
      const optionsCount = group.options?.length ?? 0;
      const currentMin = group.minSelectable;
      const currentMax = group.maxSelectable;

      let needsUpdate = false;
      let newMin = currentMin;
      let newMax = currentMax;

      if (newMax < newMin) {
        newMax = newMin;
        needsUpdate = true;
      }
      if (newMax > optionsCount) {
        newMax = optionsCount;
        needsUpdate = true;
      }

      if (newMin > newMax) {
        newMin = newMax;
        needsUpdate = true;
      }
      if (newMin < 0) {
        newMin = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        form.setValue(
          `customizationGroups.${groupIndex}.minSelectable`,
          newMin,
          { shouldDirty: true }
        );
        form.setValue(
          `customizationGroups.${groupIndex}.maxSelectable`,
          newMax,
          { shouldDirty: true }
        );
      }
    });
  }, [watchedGroups, form.setValue]);

  function handleDrop(acceptedFiles: File[]) {
    if (!acceptedFiles?.length) return;
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLocalFilePreview(dataUrl);

      setTimeout(() => {
        const mockS3Key = `uploads/item-images/${Date.now()}-${file.name}`;
        form.setValue('imageKey', mockS3Key, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setUploadLoading(false);
      }, 1200);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setLocalFilePreview('');
    form.setValue('imageKey', '', { shouldValidate: true, shouldDirty: true });
  }

  function handleFormSubmit(values: MenuItemFormData) {
    let submitCategory: { id?: number; name: string };
    if (values.isNewCategory && values.newCategoryName) {
      submitCategory = { name: values.newCategoryName.trim() };
    } else if (values.categoryId && values.categoryId !== 'add_new') {
      const selectedCat = categoryOptions.find(
        (c) => c.value === values.categoryId
      );
      submitCategory = {
        id: parseInt(values.categoryId, 10),
        name: selectedCat?.label ?? 'Unknown Category',
      };
    } else {
      console.error('Invalid category state during submission');

      form.setError('categoryId', {
        type: 'manual',
        message: 'Category selection is invalid.',
      });
      return;
    }

    const submitData: SubmitMenuItemData = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      imageKey: values.imageKey || undefined,
      category: submitCategory,
      customizationGroups:
        values.customizationGroups?.map((group) => ({
          name: group.name,
          required: group.required,
          minSelectable: group.minSelectable,
          maxSelectable: group.maxSelectable,
          options: group.options.map((opt) => ({
            name: opt.name,
            additionalPrice: opt.additionalPrice,
          })),
        })) ?? [],
    };

    onSubmit(submitData);
    onOpenChange(false);
  }

  function handleCancel() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Keep trigger the same, or adjust as needed */}
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center">
          {mode === 'create' ? (
            <>
              {' '}
              <Plus className="w-4 h-4 mr-1" /> Create Menu Item{' '}
            </>
          ) : (
            'Edit Menu Item'
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto p-6">
        {' '}
        {/* Increased height/width */}
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Menu Item' : 'Edit Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Fill out the details for the new menu item.'
              : 'Update the details for this menu item.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Add noValidate to prevent browser validation interfering with RHF/Zod */}
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* --- Basic Info --- */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Burger" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 9.99"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : parseFloat(e.target.value)
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description (max 255 chars)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Image --- */}
            <FormField
              control={form.control}
              name="imageKey"
              render={({ field }) => (
                <FormItem>
                  {/* FormLabel provided by ImageUpload component via prop */}
                  <FormControl>
                    <ImageUpload
                      label="Image (Optional)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />{' '}
                  {/* Show validation errors for imageKey if any */}
                </FormItem>
              )}
            />

            <Separator />

            {/* --- Category --- */}
            <div>
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Combobox
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        placeholder="Select or Add Category..."
                        items={categoryOptions}
                        searchable
                      />
                    </FormControl>
                    <FormMessage /> {/* Shows Zod error if selection invalid */}
                  </FormItem>
                )}
              />
              {/* Show input for new category name only if 'add_new' is selected */}
              {form.watch('isNewCategory') && (
                <FormField
                  control={form.control}
                  name="newCategoryName"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>New Category Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Sides"
                          {...field}
                          className="w-full md:w-1/2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* --- Customization Groups --- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Customization Groups</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendGroup({
                      name: '',
                      required: false,
                      minSelectable: 0,
                      maxSelectable: 1,
                      options: [{ name: '', additionalPrice: 0 }],
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Group
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define options customers can choose from, like size, toppings,
                or preparation style.
              </p>

              {groupFields.length === 0 && (
                <p className="text-sm italic text-gray-400">
                  No customization groups added yet.
                </p>
              )}

              {/* Loop through customization groups */}
              <div className="space-y-6">
                {groupFields.map((groupItem, groupIndex) => (
                  <CustomizationGroupField
                    key={groupItem.id}
                    groupIndex={groupIndex}
                    control={form.control}
                    removeGroup={removeGroup}
                    form={form}
                  />
                ))}
              </div>
            </div>

            {/* --- Action Buttons --- */}
            <Separator />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Item'
                    : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface CustomizationGroupFieldProps {
  groupIndex: number;
  control: any;
  removeGroup: (index: number) => void;
  form: ReturnType<typeof useForm<MenuItemFormData>>;
}

function CustomizationGroupField({
  groupIndex,
  control,
  removeGroup,
  form,
}: CustomizationGroupFieldProps) {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `customizationGroups.${groupIndex}.options`,
  });

  const optionsCount =
    form.watch(`customizationGroups.${groupIndex}.options`)?.length ?? 0;

  return (
    <div className="p-4 border rounded-md bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
      <div className="flex items-center justify-between mb-3">
        {/* Group Name */}
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.name`}
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel className="sr-only">Group Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Group Name (e.g., Size, Toppings)"
                  {...field}
                  className="text-base font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeGroup(groupIndex)}
          className="ml-2 text-red-500 hover:text-red-700"
          aria-label="Remove group"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Group Settings: Required, Min/Max Selectable */}
      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
        {/* Required Checkbox */}
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.required`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 p-2 mt-auto border rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={`required-${groupIndex}`}
                />
              </FormControl>
              <FormLabel
                htmlFor={`required-${groupIndex}`}
                className="mb-0 text-sm font-normal cursor-pointer"
              >
                Required?
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-1 text-xs text-gray-400">[?]</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Customer must choose from this group.
                  </TooltipContent>
                </Tooltip>
              </FormLabel>
            </FormItem>
          )}
        />
        {/* Min Selectable */}
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.minSelectable`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Min Choices</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                  value={field.value ?? 0}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Max Selectable */}
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.maxSelectable`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Max Choices</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max={optionsCount}
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value, 10) || 0)
                  }
                  value={field.value ?? 0}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Validation hint for min/max */}
      {form.formState.errors.customizationGroups?.[groupIndex]
        ?.maxSelectable && (
        <p className="mb-2 -mt-2 text-xs text-red-500">
          Max choices cannot exceed the number of options ({optionsCount}) and
          must be &gt; min choices.
        </p>
      )}
      {form.formState.errors.customizationGroups?.[groupIndex]
        ?.minSelectable && (
        <p className="mb-2 -mt-2 text-xs text-red-500">
          Min choices must be less than or equal to max choices.
        </p>
      )}

      {/* Options List */}
      <div className="space-y-3">
        <FormLabel className="text-sm font-medium">Options</FormLabel>
        {optionFields.length === 0 && (
          <p className="text-xs italic text-gray-400">
            Add at least one option.
          </p>
        )}
        {optionFields.map((optionItem, optionIndex) => (
          <div key={optionItem.id} className="flex items-center gap-2">
            {/* Option Name */}
            <FormField
              control={control}
              name={`customizationGroups.${groupIndex}.options.${optionIndex}.name`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Option Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Option Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Option Additional Price */}
            <FormField
              control={control}
              name={`customizationGroups.${groupIndex}.options.${optionIndex}.additionalPrice`}
              render={({ field }) => (
                <FormItem className="w-28">
                  {' '}
                  {/* Fixed width */}
                  <FormLabel className="sr-only">Additional Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="+ Price"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === '' ? 0 : parseFloat(e.target.value)
                        )
                      }
                      value={field.value ?? ''}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(optionIndex)}
              className="w-8 h-8 text-red-500 shrink-0 hover:bg-red-100 dark:hover:bg-red-900/50"
              aria-label="Remove option"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendOption({ name: '', additionalPrice: 0 })}
          className="mt-2"
        >
          + Add Option
        </Button>
        {/* Show group-level error if less than one option */}
        {form.formState.errors.customizationGroups?.[groupIndex]?.options
          ?.type === 'too_small' && (
          <p className="mt-1 text-xs text-red-500">
            {
              form.formState.errors.customizationGroups?.[groupIndex]?.options
                ?.message
            }
          </p>
        )}
      </div>
    </div>
  );
}
