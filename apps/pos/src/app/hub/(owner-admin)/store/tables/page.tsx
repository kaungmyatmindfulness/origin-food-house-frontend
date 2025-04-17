'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDebounceValue } from 'usehooks-ts';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  getAllTables,
  replaceAllTables,
} from '@/features/tables/services/table.services';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
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
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Separator } from '@repo/ui/components/separator';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  BatchReplaceTablesDto,
  BatchOperationResponseDto,
  TableResponseDto,
} from '@/features/tables/types/table.types';
import type { ApiError } from '@/utils/apiFetch';
import { Skeleton } from '@repo/ui/components/skeleton';

const MAX_TABLES = 100;
const MAX_PREFIX_LENGTH = 10;
const MAX_TABLE_NAME_LENGTH = 50;

export const tableBatchSchema = z
  .object({
    numberOfTables: z.coerce
      .number({ required_error: 'Number of tables is required.' })
      .int('Number of tables must be a whole number.')
      .min(1, 'At least one table is required.')
      .max(MAX_TABLES, `Maximum number of tables allowed is ${MAX_TABLES}.`),
    tableNamePrefix: z
      .string()
      .trim()

      .max(
        MAX_PREFIX_LENGTH,
        `Prefix cannot exceed ${MAX_PREFIX_LENGTH} characters.`
      )
      .optional(),
    tables: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(1, 'Table name cannot be empty.')
            .max(
              MAX_TABLE_NAME_LENGTH,
              `Table name cannot exceed ${MAX_TABLE_NAME_LENGTH} characters.`
            ),
        })
      )
      .min(1, 'At least one table definition is required.'),
  })
  .refine(
    (data) => {
      const names = data.tables.map((t) => t.name);
      return new Set(names).size === names.length;
    },
    {
      message: 'Generated table names must be unique.',
      path: ['tables'],
    }
  );

export type TableBatchFormData = z.infer<typeof tableBatchSchema>;

const generateTableNames = (
  count: number,
  prefix?: string | null
): { name: string }[] => {
  if (isNaN(count) || count <= 0) return [];

  const trimmedPrefix = prefix?.trim();

  return Array.from({ length: count }, (_, i) => {
    const number = i + 1;

    const name = trimmedPrefix ? `${trimmedPrefix}-${number}` : `${number}`;
    return { name };
  });
};

const storeTablesQueryKey = (storeId: string | null) => ['tables', storeId];

export default function StoreTablesPage() {
  const queryClient = useQueryClient();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const {
    data: fetchedTables,
    isLoading: isLoadingTables,
    isError: isTablesError,
    error: tablesError,
    isSuccess: isTablesSuccess,
  } = useQuery<TableResponseDto[], Error>({
    queryKey: storeTablesQueryKey(selectedStoreId),
    queryFn: async () => {
      if (!selectedStoreId) return [];
      return getAllTables(selectedStoreId);
    },
    enabled: !!selectedStoreId,
    refetchOnWindowFocus: false,
  });

  const form = useForm<TableBatchFormData>({
    resolver: zodResolver(tableBatchSchema),
    defaultValues: {
      numberOfTables: 0,
      tableNamePrefix: '',
      tables: [],
    },
    mode: 'onChange',
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'tables',
    keyName: 'fieldId',
  });

  useEffect(() => {
    if (isTablesSuccess && selectedStoreId && !form.formState.isDirty) {
      if (fetchedTables && fetchedTables.length > 0) {
        console.log('Populating form with fetched tables:', fetchedTables);
        form.reset(
          {
            numberOfTables: fetchedTables.length,
            tableNamePrefix: fetchedTables?.[0]?.name.split('-')[0] || '',
            tables: fetchedTables.map((table) => ({ name: table.name })),
          },
          { keepDefaultValues: false }
        );
      } else {
        console.log('No existing tables found, setting generator defaults.');
        const defaultNum = 10;
        const defaultPrefix = '';
        form.reset(
          {
            numberOfTables: defaultNum,
            tableNamePrefix: defaultPrefix,
            tables: generateTableNames(defaultNum, defaultPrefix),
          },
          { keepDefaultValues: false }
        );
      }
    }
  }, [
    isTablesSuccess,
    fetchedTables,
    selectedStoreId,
    form.reset,
    form.formState.isDirty,
    form,
  ]);

  const watchedNumberOfTables = form.watch('numberOfTables');
  const watchedTableNamePrefix = form.watch('tableNamePrefix');

  const [debouncedCount, setDebouncedCount] = useDebounceValue(
    watchedNumberOfTables,
    400
  );
  const [debouncedPrefix, setDebouncedPrefix] = useDebounceValue(
    watchedTableNamePrefix,
    400
  );

  useEffect(() => {
    if (isTablesSuccess) {
      setDebouncedCount(watchedNumberOfTables);
      setDebouncedPrefix(watchedTableNamePrefix);
    }
  }, [
    isTablesSuccess,
    watchedNumberOfTables,
    watchedTableNamePrefix,
    setDebouncedCount,
    setDebouncedPrefix,
  ]);

  useEffect(() => {
    if (!isTablesSuccess || !form.formState.isDirty) {
      return;
    }

    const newTables = generateTableNames(debouncedCount, debouncedPrefix);
    replace(newTables);
    form
      .trigger('tables')
      .catch((err) => console.warn('Validation trigger failed silently:', err));
  }, [debouncedCount, debouncedPrefix, form, isTablesSuccess, replace]);

  const replaceTablesMutation = useMutation<
    BatchOperationResponseDto,
    ApiError | Error,
    BatchReplaceTablesDto
  >({
    mutationFn: async (payload: BatchReplaceTablesDto) => {
      if (!selectedStoreId) throw new Error('Store not selected');
      const trimmedPayload = {
        tables: payload.tables.map((t) => ({ name: t.name.trim() })),
      };
      return replaceAllTables(selectedStoreId, trimmedPayload);
    },
    onSuccess: (data) => {
      toast.success(`${data.count} tables created/updated successfully!`);
      queryClient.invalidateQueries({
        queryKey: storeTablesQueryKey(selectedStoreId),
      });
      form.reset(form.getValues());
    },
    onError: (error) => {
      console.error('Failed to replace tables:', error);
    },
  });

  function onSubmit(values: TableBatchFormData) {
    if (!selectedStoreId) {
      toast.error('Cannot save: Store not selected.');
      return;
    }
    const apiPayload: BatchReplaceTablesDto = {
      tables: values.tables.map((t) => ({ name: t.name.trim() })),
    };
    console.log('Submitting replace tables payload:', apiPayload);
    replaceTablesMutation.mutate(apiPayload);
  }

  if (isLoadingTables) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 md:p-8">
        <header>
          <Skeleton className="mb-2 h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </header>
        <Skeleton className="h-20 w-full" /> {/* Alert placeholder */}
        <Card>
          <CardHeader>
            <Skeleton className="mb-1 h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Separator />
            <Skeleton className="h-72 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t px-6 py-4 dark:border-gray-700">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  if (isTablesError) {
    return (
      <div className="text-destructive mx-auto max-w-4xl p-6 text-center">
        <AlertCircle className="text-destructive mx-auto mb-2 h-10 w-10" />
        <p className="font-semibold">Error Loading Existing Tables</p>
        {tablesError instanceof Error && (
          <p className="mt-1 text-sm">{tablesError.message}</p>
        )}
        <p className="mt-2 text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 md:p-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Manage Tables</h1>
        <p className="text-muted-foreground">
          Define the tables available in your store. Use the generator for quick
          setup or edit names individually.
        </p>
      </header>

      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Important: Replaces All Tables</AlertTitle>
        <AlertDescription>
          Submitting this form will **delete all existing tables** and replace
          them with the list below. This action cannot be undone. Ensure no
          tables have active orders before proceeding.
        </AlertDescription>
      </Alert>

      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Generate / Edit Tables</CardTitle>
              <CardDescription>
                Use the fields below to generate a list, then edit names as
                needed before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generator Inputs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Prefix Field - Now Optional */}
                <FormField
                  control={form.control}
                  name="tableNamePrefix"
                  render={({ field }) => (
                    <FormItem>
                      {/* Removed asterisk from label */}
                      <FormLabel>Table Name Prefix</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., T (Optional)"
                          maxLength={10}
                          {...field}
                          disabled={replaceTablesMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Number of Tables Field */}
                <FormField
                  control={form.control}
                  name="numberOfTables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Tables *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g., 10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? ''
                                : parseInt(e.target.value, 10)
                            )
                          }
                          value={field.value ?? ''}
                          disabled={replaceTablesMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Dynamic Table Name List */}
              <div>
                <FormLabel className="text-base font-medium">
                  Table Names
                </FormLabel>
                <FormDescription className="mb-4">
                  Review and edit the generated/loaded table names below. The
                  final list will replace all current tables upon submission.
                </FormDescription>
                <ScrollArea className="h-72 w-full rounded-md border p-4 dark:border-gray-700">
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.fieldId}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="flex items-center gap-2"
                        >
                          <FormField
                            control={form.control}
                            name={`tables.${index}.name`}
                            render={({ field: tableField }) => (
                              <FormItem className="flex-grow">
                                <FormLabel className="sr-only">
                                  Table Name {index + 1}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={`Table Name ${index + 1}`}
                                    {...tableField}
                                    disabled={replaceTablesMutation.isPending}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
                <FormMessage>
                  {form.formState.errors.tables?.message}
                </FormMessage>
                <FormMessage>
                  {form.formState.errors.tables?.root?.message}
                </FormMessage>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t px-6 py-4 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.reset(undefined, { keepDefaultValues: true })
                }
                disabled={replaceTablesMutation.isPending}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                disabled={
                  !selectedStoreId ||
                  replaceTablesMutation.isPending ||
                  !form.formState.isValid ||
                  !form.formState.isDirty
                }
              >
                {replaceTablesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Replace All Tables
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
