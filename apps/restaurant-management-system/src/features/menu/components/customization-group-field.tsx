'use client';

import { HelpCircle, PlusIcon, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@repo/ui/components/button';
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
import { MenuItemFormData } from '@/features/menu/components/menu-item-form-dialog';

interface CustomizationGroupFieldProps {
  groupIndex: number;
  control: ReturnType<typeof useForm<MenuItemFormData>>['control'];
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
    <div className="bg-muted dark:border-border dark:bg-muted/30 rounded-md border p-4">
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
          size="icon"
          onClick={() => removeGroup(groupIndex)}
          className="ml-2 h-11 w-11 shrink-0 text-red-500 hover:bg-red-100 hover:text-red-700 active:scale-95 dark:hover:bg-red-900/50"
          aria-label="Remove group"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
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
          <p className="text-muted-foreground text-xs italic">
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
              className="h-11 w-11 shrink-0 text-red-500 hover:bg-red-100 active:scale-95 dark:hover:bg-red-900/50"
              aria-label="Remove option"
            >
              <Trash2 className="h-5 w-5" />
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

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name={`customizationGroups.${groupIndex}.minSelectable`}
          render={({ field }) => (
            <FormItem>
              <div className="mb-1 flex items-center gap-1">
                <FormLabel className="text-sm">Min Choices</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground h-5 w-5"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      The minimum number of options the customer must select
                      from this group (e.g., 0, 1). Must be less than or equal
                      to &apos;Max Choices&apos;.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
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
                  placeholder="e.g., 0 or 1"
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
              <div className="mb-1 flex items-center gap-1">
                <FormLabel className="text-sm">Max Choices</FormLabel>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground h-5 w-5"
                    >
                      <HelpCircle className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      The maximum number of different options the customer can
                      select (e.g., 1 for Size, 3 for Toppings). Must be equal
                      to or greater than &apos;Min Choices&apos; and cannot
                      exceed the total number of options available (
                      {optionsCount}).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max={optionsCount > 0 ? optionsCount : undefined}
                  {...field}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ''
                        ? 0
                        : parseInt(e.target.value, 10) || 0
                    )
                  }
                  value={field.value ?? 0}
                  className="w-full"
                  placeholder="e.g., 1 or 3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
