'use client';

import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from '@repo/ui/lib/toast';
import { z } from 'zod';

import { ImageUpload } from '@/common/components/widgets/image-upload';
import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import { getCategories } from '@/features/menu/services/category.service';
import {
  createMenuItem,
  getMenuItemById,
  updateMenuItem,
} from '@/features/menu/services/menu-item.service';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '@/features/menu/types/menu-item.types';
import { CustomizationGroupField } from '@/features/menu/components/customization-group-field';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Combobox } from '@repo/ui/components/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
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
import { Separator } from '@repo/ui/components/separator';
import { Textarea } from '@repo/ui/components/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Routing area enum values
 */
export const ROUTING_AREAS = [
  'GRILL',
  'FRY',
  'SALAD',
  'DRINKS',
  'DESSERT',
  'APPETIZER',
  'SOUP',
  'OTHER',
] as const;

export type RoutingArea = (typeof ROUTING_AREAS)[number];

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
    imagePath: z.string().optional(),

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

    routingArea: z.enum(ROUTING_AREAS).optional(),
    preparationTimeMinutes: z
      .number()
      .int('Must be a whole number')
      .min(1, 'Must be at least 1 minute')
      .optional()
      .nullable(),

    customizationGroups: z
      .array(
        z.object({
          name: z
            .string()
            .max(70, 'Max 70 chars')
            .nonempty('Group name required'),
          minSelectable: z.number().min(0).default(0),
          maxSelectable: z.number().min(0).default(1),
          options: z
            .array(
              z.object({
                name: z
                  .string()
                  .max(70, 'Max 70 chars')
                  .nonempty('Option name required'),
                additionalPrice: z.number().min(0, 'Must be at least 0.00'),
              })
            )
            .min(1, 'At least one option is required per group'),
        })
      )
      .optional(),

    isHidden: z.boolean().optional().default(false),
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

export type MenuFormMode = 'create' | 'edit';

interface CategoryOption {
  label: string;
  value: string;
}

export interface MenuItemFormDialogProps {
  mode: MenuFormMode;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  editItemId: string | null;
}

export function MenuItemFormDialog({
  mode,
  open,
  onOpenChange,
  editItemId,
}: MenuItemFormDialogProps) {
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const queryClient = useQueryClient();

  const {
    data: itemToEdit,
    isLoading: isItemLoading,
    isError: isItemError,
    error: itemError,
  } = useQuery({
    queryKey: ['menuItem', editItemId],
    queryFn: async () => {
      if (!editItemId || !selectedStoreId) return null;

      return getMenuItemById(selectedStoreId, editItemId);
    },

    enabled:
      mode === 'edit' && typeof editItemId === 'string' && !!selectedStoreId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!selectedStoreId) return [];
      return getCategories(selectedStoreId);
    },
    enabled: !!selectedStoreId && open,
    staleTime: 10 * 60 * 1000,
  });

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: undefined,
      imagePath: '',
      categoryId: '',
      newCategoryName: '',
      isNewCategory: false,
      routingArea: undefined,
      preparationTimeMinutes: null,
      customizationGroups: [],
      isHidden: false,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && itemToEdit) {
      const mappedData: Partial<MenuItemFormData> = {
        name: itemToEdit.name,
        description: itemToEdit.description ?? '',

        basePrice: itemToEdit.basePrice
          ? parseFloat(itemToEdit.basePrice) || undefined
          : undefined,

        imagePath: itemToEdit.imagePath ?? undefined,

        categoryId: itemToEdit.category.id
          ? String(itemToEdit.category.id)
          : undefined,
        isNewCategory: false,
        newCategoryName: '',
        routingArea:
          (
            itemToEdit as typeof itemToEdit & {
              routingArea?: RoutingArea;
            }
          ).routingArea ?? undefined,
        preparationTimeMinutes:
          (
            itemToEdit as typeof itemToEdit & {
              preparationTimeMinutes?: number;
            }
          ).preparationTimeMinutes ?? null,
        customizationGroups:
          itemToEdit.customizationGroups?.map((group) => ({
            name: group.name,
            required: group.required,
            minSelectable: group.minSelectable,
            maxSelectable: group.maxSelectable,
            options:
              group.customizationOptions?.map((opt) => ({
                name: opt.name,
                additionalPrice: opt.additionalPrice
                  ? parseFloat(opt.additionalPrice) || 0
                  : 0,
              })) || [],
          })) || [],
        isHidden: itemToEdit.isHidden ?? false,
      };

      form.reset(mappedData);
    }
  }, [itemToEdit, mode, form.reset, form]);

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

  useEffect(() => {}, [watchedGroups, form.setValue, form]);

  const createMenuItemMutation = useMutation({
    mutationFn: (dto: CreateMenuItemDto) => {
      if (!selectedStoreId) throw new Error('Store ID required for creation.');

      return createMenuItem(selectedStoreId, dto);
    },
    onSuccess: () => {
      toast.success('Menu item created!');
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      queryClient.invalidateQueries({
        queryKey: ['menuItems'],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Create item failed:', error);
      toast.error('Failed to create menu item', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: (dto: UpdateMenuItemDto) => {
      if (!editItemId) throw new Error('Item ID required for update.');
      if (!selectedStoreId) throw new Error('Store ID required for update.');

      return updateMenuItem(editItemId, selectedStoreId, dto);
    },
    onSuccess: () => {
      toast.success('Menu item updated!');
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      queryClient.invalidateQueries({
        queryKey: ['menuItems'],
      });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Update item failed:', error);
      toast.error('Failed to update menu item', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  async function handleFormSubmit(values: MenuItemFormData) {
    if (!selectedStoreId) {
      toast.error('Cannot save: Store not selected.');
      return;
    }

    let submitCategory: { id?: string; name: string };
    if (values.isNewCategory && values.newCategoryName) {
      submitCategory = { name: values.newCategoryName.trim() };
    } else if (values.categoryId && values.categoryId !== 'add_new') {
      const selectedCatData = categories.find(
        (c) => String(c.id) === values.categoryId
      );
      submitCategory = {
        id: values.categoryId,
        name: selectedCatData?.name ?? 'Selected Category',
      };
    } else {
      form.setError('categoryId', {
        type: 'manual',
        message: 'Category is required.',
      });
      return;
    }

    const baseSubmitData = {
      name: values.name,
      description: values.description || undefined,
      basePrice: String(values.basePrice),
      imagePath: values.imagePath || undefined,
      category: submitCategory,
      routingArea: values.routingArea || undefined,
      preparationTimeMinutes: values.preparationTimeMinutes || undefined,
      customizationGroups:
        values.customizationGroups?.map((group) => ({
          name: group.name,
          minSelectable: group.minSelectable,
          maxSelectable: group.maxSelectable,
          options: group.options.map((opt) => ({
            name: opt.name,
            additionalPrice: String(opt.additionalPrice),
          })),
        })) ?? [],
      isHidden: values.isHidden ?? false,
    };

    try {
      if (mode === 'create') {
        await createMenuItemMutation.mutateAsync(baseSubmitData);
      } else if (mode === 'edit' && editItemId) {
        await updateMenuItemMutation.mutateAsync(baseSubmitData);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  }

  function handleCancel() {
    onOpenChange(false);
  }

  const categoryOptions: CategoryOption[] = useMemo(
    () => [
      ...categories.map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
      { label: 'Add New Category', value: 'add_new' },
    ],
    [categories]
  );

  if (mode === 'edit' && isItemLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Menu Item</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-10">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <span className="ml-2">Loading item data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (mode === 'edit' && isItemError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
            <DialogDescription>
              Could not load item data. Please try again.
              {itemError instanceof Error && (
                <p className="mt-2 text-xs">{itemError.message}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-3xl overflow-y-auto p-6">
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

        {Object.keys(form.formState.errors).length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please fix the following errors:</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc space-y-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    {field === 'customizationGroups' && error.message
                      ? error.message
                      : error?.message || `${field} has an error`}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      Base Price ($) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.10"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="routingArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Area (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select kitchen area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROUTING_AREAS.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Kitchen area responsible for preparing this item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preparationTimeMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (Minutes) (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 15"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? null
                              : parseInt(e.target.value, 10)
                          )
                        }
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated time to prepare this item
                    </FormDescription>
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
              name="imagePath"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      label="Image (Optional)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
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

            <FormField
              control={form.control}
              name="isHidden"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 dark:border-gray-700">
                  <FormControl>
                    {/* Use value={field.value?.toString()} if Checkbox expects string */}
                    <Checkbox
                      checked={field.value ?? false} // Ensure boolean value
                      // Pass boolean to onCheckedChange
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Hide Item from Customers</FormLabel>
                    <FormDescription>
                      Check this to temporarily hide the item from the menu
                      (e.g., out of stock, inactive).
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

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
