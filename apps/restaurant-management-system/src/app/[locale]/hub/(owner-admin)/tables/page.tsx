'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Grid3X3, List, MoreVertical, RefreshCcw, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  getTablesWithStatus,
  updateTableStatus,
} from '@/features/tables/services/table-state.service';
import {
  TableStatus,
  type ViewMode,
  type TableWithStatusDto,
} from '@/features/tables/types/table-state.types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';

const STATUS_COLORS: Record<TableStatus, string> = {
  [TableStatus.VACANT]: 'bg-gray-500',
  [TableStatus.SEATED]: 'bg-blue-500',
  [TableStatus.ORDERING]: 'bg-yellow-500',
  [TableStatus.SERVED]: 'bg-green-500',
  [TableStatus.READY_TO_PAY]: 'bg-orange-500',
  [TableStatus.CLEANING]: 'bg-red-500',
};

export default function TableStatePage() {
  const t = useTranslations('tables.statePage');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [selectedTable, setSelectedTable] = useState<TableWithStatusDto | null>(
    null
  );
  const [newStatus, setNewStatus] = useState<TableStatus | ''>('');

  // Fetch tables with auto-refresh every 30 seconds
  const {
    data: tables,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tables', selectedStoreId],
    queryFn: () => getTablesWithStatus(selectedStoreId!),
    enabled: !!selectedStoreId,
    refetchInterval: 30000, // 30 seconds
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      tableId,
      status,
    }: {
      tableId: string;
      status: TableStatus;
    }) => updateTableStatus(selectedStoreId!, tableId, { status }),
    onSuccess: () => {
      toast.success(t('statusUpdateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['tables', selectedStoreId] });
      setSelectedTable(null);
      setNewStatus('');
    },
    onError: (error: Error) => {
      toast.error(error.message || t('statusUpdateError'));
    },
  });

  const handleStatusUpdate = () => {
    if (!selectedTable || !newStatus) return;
    updateStatusMutation.mutate({
      tableId: selectedTable.id,
      status: newStatus as TableStatus,
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
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as TableStatus | 'all')
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statuses.all')}</SelectItem>
            <SelectItem value={TableStatus.VACANT}>
              {t('statuses.vacant')}
            </SelectItem>
            <SelectItem value={TableStatus.SEATED}>
              {t('statuses.seated')}
            </SelectItem>
            <SelectItem value={TableStatus.ORDERING}>
              {t('statuses.ordering')}
            </SelectItem>
            <SelectItem value={TableStatus.SERVED}>
              {t('statuses.served')}
            </SelectItem>
            <SelectItem value={TableStatus.READY_TO_PAY}>
              {t('statuses.readyToPay')}
            </SelectItem>
            <SelectItem value={TableStatus.CLEANING}>
              {t('statuses.cleaning')}
            </SelectItem>
          </SelectContent>
        </Select>
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
                          setNewStatus(table.currentStatus);
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
                        <Select
                          value={newStatus}
                          onValueChange={(value) =>
                            setNewStatus(value as TableStatus)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TableStatus.VACANT}>
                              {t('statuses.vacant')}
                            </SelectItem>
                            <SelectItem value={TableStatus.SEATED}>
                              {t('statuses.seated')}
                            </SelectItem>
                            <SelectItem value={TableStatus.ORDERING}>
                              {t('statuses.ordering')}
                            </SelectItem>
                            <SelectItem value={TableStatus.SERVED}>
                              {t('statuses.served')}
                            </SelectItem>
                            <SelectItem value={TableStatus.READY_TO_PAY}>
                              {t('statuses.readyToPay')}
                            </SelectItem>
                            <SelectItem value={TableStatus.CLEANING}>
                              {t('statuses.cleaning')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                        variant="outline"
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
                          setNewStatus(table.currentStatus);
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
                        <Select
                          value={newStatus}
                          onValueChange={(value) =>
                            setNewStatus(value as TableStatus)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TableStatus.VACANT}>
                              {t('statuses.vacant')}
                            </SelectItem>
                            <SelectItem value={TableStatus.SEATED}>
                              {t('statuses.seated')}
                            </SelectItem>
                            <SelectItem value={TableStatus.ORDERING}>
                              {t('statuses.ordering')}
                            </SelectItem>
                            <SelectItem value={TableStatus.SERVED}>
                              {t('statuses.served')}
                            </SelectItem>
                            <SelectItem value={TableStatus.READY_TO_PAY}>
                              {t('statuses.readyToPay')}
                            </SelectItem>
                            <SelectItem value={TableStatus.CLEANING}>
                              {t('statuses.cleaning')}
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
