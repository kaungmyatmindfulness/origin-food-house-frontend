'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Search, FileText } from 'lucide-react';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  getAuditLogs,
  exportAuditLogsCsv,
  downloadCsvBlob,
} from '@/features/audit-logs/services/audit-log.service';
import { auditLogKeys } from '@/features/audit-logs/queries/audit-log.keys';
import type {
  AuditLogFilters,
  AuditAction,
} from '@/features/audit-logs/types/audit-log.types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Badge } from '@repo/ui/components/badge';
import { toast } from '@repo/ui/lib/toast';

const AUDIT_ACTIONS: AuditAction[] = [
  'STORE_SETTING_CHANGED',
  'MENU_PRICE_CHANGED',
  'USER_ROLE_CHANGED',
  'USER_SUSPENDED',
  'PAYMENT_REFUNDED',
  'CATEGORY_CREATED',
  'CATEGORY_UPDATED',
  'CATEGORY_DELETED',
  'MENU_ITEM_CREATED',
  'MENU_ITEM_UPDATED',
  'MENU_ITEM_DELETED',
  'TABLE_CREATED',
  'TABLE_UPDATED',
  'TABLE_DELETED',
  'ORDER_CREATED',
  'ORDER_STATUS_CHANGED',
  'PAYMENT_RECORDED',
];

export default function AuditLogsPage() {
  const t = useTranslations('auditLogs');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: undefined,
    userId: undefined,
    startDate: undefined,
    endDate: undefined,
    keyword: undefined,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Fetch audit logs
  const {
    data: auditLogsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: auditLogKeys.list(selectedStoreId!, page, filters),
    queryFn: () => getAuditLogs(selectedStoreId!, page, filters),
    enabled: !!selectedStoreId,
  });

  // Handle filter changes
  const handleFilterChange = (
    key: keyof AuditLogFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle export to CSV
  const handleExport = async () => {
    if (!selectedStoreId) return;

    setIsExporting(true);
    try {
      const blob = await exportAuditLogsCsv(selectedStoreId, filters);
      downloadCsvBlob(blob, selectedStoreId);
      toast.success(t('exportSuccess'));
    } catch (error) {
      toast.error(t('exportError'));
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedStoreId) {
    return (
      <div className="flex h-screen items-center justify-center">
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

        <Button
          onClick={handleExport}
          disabled={isExporting || !auditLogsData?.items.length}
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? t('exporting') : t('export')}
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
          <CardDescription>{t('filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('filters.action')}
              </label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) =>
                  handleFilterChange(
                    'action',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.actionPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allActions')}</SelectItem>
                  {AUDIT_ACTIONS.map((action) => (
                    <SelectItem key={action} value={action}>
                      {t(`actions.${action}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('filters.startDate')}
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('filters.endDate')}
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Keyword Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('filters.keyword')}
              </label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder={t('filters.keywordPlaceholder')}
                  value={filters.keyword || ''}
                  onChange={(e) =>
                    handleFilterChange('keyword', e.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tableTitle')}</CardTitle>
          <CardDescription>
            {auditLogsData
              ? t('showingResults', {
                  from: (page - 1) * 50 + 1,
                  to: Math.min(page * 50, auditLogsData.total),
                  total: auditLogsData.total,
                })
              : t('loadingResults')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-destructive mb-2">{t('errorLoading')}</p>
              <p className="text-muted-foreground text-sm">
                {t('errorLoadingDescription')}
              </p>
            </div>
          ) : !auditLogsData?.items.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-2">{t('noLogs')}</p>
              <p className="text-muted-foreground text-sm">
                {t('noLogsDescription')}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">
                        {t('columns.timestamp')}
                      </TableHead>
                      <TableHead>{t('columns.user')}</TableHead>
                      <TableHead>{t('columns.action')}</TableHead>
                      <TableHead>{t('columns.details')}</TableHead>
                      <TableHead className="w-[140px]">
                        {t('columns.ipAddress')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogsData.items.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {format(
                            new Date(log.timestamp),
                            'MMM dd, yyyy HH:mm:ss'
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.userName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`actions.${log.action}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {log.details}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {auditLogsData.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    {t('pagination.page', {
                      current: page,
                      total: auditLogsData.totalPages,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t('pagination.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= auditLogsData.totalPages}
                    >
                      {t('pagination.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
