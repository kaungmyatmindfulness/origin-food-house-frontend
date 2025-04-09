'use client';

import { PlusIcon, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui/components/tooltip';
import { MenuItemFormData } from '@/features/menu/ui/menu-item-form-dialog';

interface CustomizationGroupFieldProps {
  groupIndex: number;
  control: any;
  removeGroup: (index: number) => void;
  form: ReturnType<typeof useForm<MenuItemFormData>>;
}

export function CustomizationGroupField({
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
    <div className="rounded-md border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
      <div className="mb-3 flex items-center justify-between">
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
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.required`}
          render={({ field }) => (
            <FormItem className="mt-auto flex items-center gap-2 rounded-md border p-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id={`required-${groupIndex}`}
                />
              </FormControl>
              <FormLabel
                htmlFor={`required-${groupIndex}`}
                className="mb-0 cursor-pointer text-sm font-normal"
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

      {form.formState.errors.customizationGroups?.[groupIndex]
        ?.maxSelectable && (
        <p className="-mt-2 mb-2 text-xs text-red-500">
          Max choices cannot exceed the number of options ({optionsCount}) and
          must be &gt; min choices.
        </p>
      )}
      {form.formState.errors.customizationGroups?.[groupIndex]
        ?.minSelectable && (
        <p className="-mt-2 mb-2 text-xs text-red-500">
          Min choices must be less than or equal to max choices.
        </p>
      )}

      <div className="space-y-3">
        <FormLabel className="text-sm font-medium">Options</FormLabel>
        {optionFields.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            Add at least one option.
          </p>
        )}
        {optionFields.map((optionItem, optionIndex) => (
          <div key={optionItem.id} className="flex items-center gap-2">
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

            <FormField
              control={control}
              name={`customizationGroups.${groupIndex}.options.${optionIndex}.additionalPrice`}
              render={({ field }) => (
                <FormItem className="w-28">
                  {' '}
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
              className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
              aria-label="Remove option"
            >
              <Trash2 className="h-4 w-4" />
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
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add Option
        </Button>

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
