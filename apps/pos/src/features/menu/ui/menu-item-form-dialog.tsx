'use client';

import { Plus, PlusIcon, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ImageUpload } from '@/common/components/widgets/image-upload';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCategories } from '@/features/menu/services/category.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Combobox } from '@repo/ui/components/combobox';
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
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Separator } from '@repo/ui/components/separator';
import { Textarea } from '@repo/ui/components/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMenuItem } from '@/features/menu/services/menu-item.service';
import { CreateMenuItemDto } from '@/features/menu/types/menu-item.types';
import { CustomizationGroupField } from '@/features/menu/ui/customization-group-field';

/**
 * Zod schema for the new menu item form structure.
 */
const menuItemSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(70),
    description: z.string().max(255),
    basePrice: z
      .number({ invalid_type_error: 'Base price required' })
      .min(0.01, 'Must be at least 0.01'),
    imageUrl: z.string().optional(),

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
                additionalPrice: z.number().min(0.01, 'Must be at least 0.01'),
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

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

export interface SubmitMenuItemData {
  name: string;
  description: string;
  basePrice: string;
  imageUrl?: string;
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

export type MenuFormMode = 'create' | 'edit';

interface CategoryOption {
  label: string;
  value: string;
}

export interface MenuItemFormDialogProps {
  mode: MenuFormMode;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  initialValues?: Partial<SubmitMenuItemData>;
}

export function MenuItemFormDialog({
  mode,
  open,
  onOpenChange,
  initialValues,
}: MenuItemFormDialogProps) {
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: [
      'categories',
      {
        storeId: selectedStoreId,
      },
    ],
    queryFn: () => getCategories(selectedStoreId!),
    enabled: !!selectedStoreId,
  });

  const categoryOptions: CategoryOption[] = [
    ...categories.map((cat) => ({
      label: cat.name,
      value: String(cat.id),
    })),
    { label: 'Add New Category', value: 'add_new' },
  ];

  const mutateCreateMenuItem = useMutation({
    mutationFn: (dto: CreateMenuItemDto) =>
      createMenuItem(selectedStoreId!, dto),
  });

  const mapInitialValuesToFormData = (
    initial?: Partial<SubmitMenuItemData>
  ): Partial<MenuItemFormData> => {
    if (!initial) return {};
    return {
      name: initial.name,
      description: initial.description,
      basePrice: Number(initial.basePrice),
      imageUrl: initial.imageUrl,

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
      imageUrl: '',
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
    } else {
      form.reset({
        name: '',
        description: '',
        basePrice: 0,
        imageUrl: '',
        categoryId: '',
        newCategoryName: '',
        isNewCategory: false,
        customizationGroups: [],
      });
    }
  }, [initialValues, form.reset, form]);

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
  }, [watchedGroups, form.setValue, form]);

  async function handleFormSubmit(values: MenuItemFormData) {
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
      basePrice: String(values.basePrice),
      imageUrl: values.imageUrl || undefined,
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

    await mutateCreateMenuItem.mutateAsync(submitData);
    await queryClient.invalidateQueries({
      queryKey: ['categories'],
    });
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
              {' '}
              <Plus className="mr-1 h-4 w-4" /> Create Menu Item{' '}
            </>
          ) : (
            'Edit Menu Item'
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto p-6">
        {' '}
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
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
            noValidate
          >
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      label="Image (Optional)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />{' '}
                </FormItem>
              )}
            />

            <Separator />

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
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                  <Plus className="mr-1 h-4 w-4" /> Add Group
                </Button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define options customers can choose from, like size, toppings,
                or preparation style.
              </p>

              {groupFields.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No customization groups added yet.
                </p>
              )}

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
