'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { Grid3X3, List, MoreVertical, RefreshCcw, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@repo/ui/lib/toast';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  TableStatus,
  type ViewMode,
  type TableWithSessionDto,
} from '@/features/tables/types/table-state.types';
import { SocketProvider } from '@/utils/socket-provider';
import { useTableSocket } from '@/features/tables/hooks/useTableSocket';
import { $api } from '@/utils/apiFetch';

import type { UpdateTableStatusDto } from '@repo/api/generated/types';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  TypedSelect,
  type TypedSelectOption,
} from '@repo/ui/components/typed-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';

const STATUS_COLORS: Record<TableStatus, string> = {
  [TableStatus.VACANT]: 'bg-muted text-muted-foreground',
  [TableStatus.SEATED]: 'bg-chart-1 text-white',
  [TableStatus.ORDERING]: 'bg-chart-3 text-white',
  [TableStatus.SERVED]: 'bg-chart-4 text-white',
  [TableStatus.READY_TO_PAY]: 'bg-chart-5 text-white',
  [TableStatus.CLEANING]: 'bg-destructive text-destructive-foreground',
};

function TableStateContent() {
  const t = useTranslations('tables.statePage');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const queryClient = useQueryClient();

  useTableSocket(selectedStoreId);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [selectedTable, setSelectedTable] =
    useState<TableWithSessionDto | null>(null);
  const [newStatus, setNewStatus] = useState<TableStatus | ''>('');

  // Status filter options (includes 'all')
  type StatusFilterValue = TableStatus | 'all';
  const statusFilterOptions = useMemo<TypedSelectOption<StatusFilterValue>[]>(
    () => [
      { value: 'all', label: t('statuses.all') },
      { value: TableStatus.VACANT, label: t('statuses.vacant') },
      { value: TableStatus.SEATED, label: t('statuses.seated') },
      { value: TableStatus.ORDERING, label: t('statuses.ordering') },
      { value: TableStatus.SERVED, label: t('statuses.served') },
      { value: TableStatus.READY_TO_PAY, label: t('statuses.readyToPay') },
      { value: TableStatus.CLEANING, label: t('statuses.cleaning') },
    ],
    [t]
  );

  // Status options for changing table status (no 'all')
  const tableStatusOptions = useMemo<TypedSelectOption<TableStatus>[]>(
    () => [
      { value: TableStatus.VACANT, label: t('statuses.vacant') },
      { value: TableStatus.SEATED, label: t('statuses.seated') },
      { value: TableStatus.ORDERING, label: t('statuses.ordering') },
      { value: TableStatus.SERVED, label: t('statuses.served') },
      { value: TableStatus.READY_TO_PAY, label: t('statuses.readyToPay') },
      { value: TableStatus.CLEANING, label: t('statuses.cleaning') },
    ],
    [t]
  );

  // Fetch tables with auto-refresh every 30 seconds
  const {
    data: tablesResponse,
    isLoading,
    isError,
    refetch,
  } = $api.useQuery(
    'get',
    '/stores/{storeId}/tables',
    { params: { path: { storeId: selectedStoreId! } } },
    {
      enabled: !!selectedStoreId,
      refetchInterval: 30000, // 30 seconds
    }
  );

  // Extract data from wrapped response
  // Cast to TableWithSessionDto[] since the API may include activeSession in the future
  // Currently activeSession is always undefined (not provided by API)
  const tables = (tablesResponse?.data ?? []) as TableWithSessionDto[];

  // Update status mutation
  const updateStatusMutation = $api.useMutation(
    'patch',
    '/stores/{storeId}/tables/{tableId}/status',
    {
      onSuccess: () => {
        toast.success(t('statusUpdateSuccess'));
        queryClient.invalidateQueries({
          queryKey: ['get', '/stores/{storeId}/tables'],
        });
        setSelectedTable(null);
        setNewStatus('');
      },
      onError: (error: unknown) => {
        toast.error(
          error instanceof Error ? error.message : t('statusUpdateError')
        );
      },
    }
  );

  const handleStatusUpdate = () => {
    if (!selectedTable || !newStatus || !selectedStoreId) return;
    updateStatusMutation.mutate({
      params: {
        path: { storeId: selectedStoreId, tableId: selectedTable.id },
      },
      body: { status: newStatus as UpdateTableStatusDto['status'] },
    });
  };

  // Filter tables by status
  const filteredTables = tables?.filter((table) => {
    if (statusFilter === 'all') return true;
    return table.currentStatus === statusFilter;
  });

  if (!selectedStoreId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">{t('noStoreSelected')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* View Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{t('filterByStatus')}:</span>
        <TypedSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={statusFilterOptions}
          triggerClassName="w-[180px]"
        />
      </div>

      {/* Tables Display */}
      {isLoading ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-4'
          }
        >
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive">{t('errorLoading')}</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
            >
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      ) : filteredTables && filteredTables.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{t('noTables')}</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables?.map((table) => (
            <Card key={table.id} className="overflow-hidden">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTable(table);
                          setNewStatus(table.currentStatus as TableStatus);
                        }}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('changeStatus')}</DialogTitle>
                        <DialogDescription>
                          {t('changeStatusDescription', { table: table.name })}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <TypedSelect
                          value={newStatus || TableStatus.VACANT}
                          onValueChange={setNewStatus}
                          options={tableStatusOptions}
                          placeholder={t('selectStatus')}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={
                            !newStatus ||
                            newStatus === table.currentStatus ||
                            updateStatusMutation.isPending
                          }
                        >
                          {updateStatusMutation.isPending
                            ? t('updating')
                            : t('confirm')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Badge className={STATUS_COLORS[table.currentStatus]}>
                  {t(`statuses.${table.currentStatus.toLowerCase()}`)}
                </Badge>
              </CardHeader>
              <CardContent>
                {table.activeSession ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                        {table.activeSession.guestCount} {t('guests')}
                      </span>
                    </div>
                    {table.activeSession.customerName && (
                      <p className="text-muted-foreground">
                        {table.activeSession.customerName}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {t('active')}{' '}
                      {formatDistanceToNow(
                        new Date(table.activeSession.createdAt),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t('noActiveSession')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTables?.map((table) => (
                <div
                  key={table.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[120px]">
                      <p className="font-medium">{table.name}</p>
                      <Badge
                        className={`${STATUS_COLORS[table.currentStatus]} mt-1`}
                      >
                        {t(`statuses.${table.currentStatus.toLowerCase()}`)}
                      </Badge>
                    </div>
                    {table.activeSession ? (
                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {table.activeSession.guestCount}
                        </span>
                        {table.activeSession.customerName && (
                          <span>{table.activeSession.customerName}</span>
                        )}
                        <span className="text-xs">
                          {formatDistanceToNow(
                            new Date(table.activeSession.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {t('noActiveSession')}
                      </p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTable(table);
                          setNewStatus(table.currentStatus as TableStatus);
                        }}
                      >
                        {t('changeStatus')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('changeStatus')}</DialogTitle>
                        <DialogDescription>
                          {t('changeStatusDescription', { table: table.name })}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <TypedSelect
                          value={newStatus || TableStatus.VACANT}
                          onValueChange={setNewStatus}
                          options={tableStatusOptions}
                          placeholder={t('selectStatus')}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={
                            !newStatus ||
                            newStatus === table.currentStatus ||
                            updateStatusMutation.isPending
                          }
                        >
                          {updateStatusMutation.isPending
                            ? t('updating')
                            : t('confirm')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TableStatePage() {
  return (
    <SocketProvider namespace="/table">
      <TableStateContent />
    </SocketProvider>
  );
}
