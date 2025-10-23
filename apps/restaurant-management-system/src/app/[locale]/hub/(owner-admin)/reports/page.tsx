'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Download,
} from 'lucide-react';
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import Papa from 'papaparse';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  selectSelectedStoreId,
  useAuthStore,
} from '@/features/auth/store/auth.store';
import {
  getSalesSummary,
  getPopularItems,
  getPaymentBreakdown,
} from '@/features/reports/services/report.service';
import { reportKeys } from '@/features/reports/queries/report.keys';
import type {
  DateRangePreset,
  PaymentMethod,
} from '@/features/reports/types/report.types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/ui/components/tabs';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
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

const COLORS = {
  CASH: '#10B981',
  CARD: '#3B82F6',
  MOBILE_PAYMENT: '#F59E0B',
  BANK_TRANSFER: '#8B5CF6',
  OTHER: '#6B7280',
};

export default function ReportsPage() {
  const t = useTranslations('reports');
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [datePreset, setDatePreset] = useState<DateRangePreset>('month');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Calculate date range based on preset
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now) };
      case 'week':
        return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
      case 'month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
      case 'custom':
        return {
          startDate: customStartDate || startOfMonth(now),
          endDate: customEndDate || endOfMonth(now),
        };
      default:
        return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Fetch sales summary
  const {
    data: salesSummary,
    isLoading: isLoadingSales,
    isError: isErrorSales,
  } = useQuery({
    queryKey: reportKeys.salesSummary(selectedStoreId!, startDate, endDate),
    queryFn: () => getSalesSummary(selectedStoreId!, startDate, endDate),
    enabled: !!selectedStoreId,
  });

  // Fetch popular items
  const {
    data: popularItems,
    isLoading: isLoadingPopular,
    isError: isErrorPopular,
  } = useQuery({
    queryKey: reportKeys.popularItems(selectedStoreId!, 10, startDate, endDate),
    queryFn: () => getPopularItems(selectedStoreId!, 10, startDate, endDate),
    enabled: !!selectedStoreId,
  });

  // Fetch payment breakdown
  const {
    data: paymentBreakdown,
    isLoading: isLoadingPayment,
    isError: isErrorPayment,
  } = useQuery({
    queryKey: reportKeys.paymentBreakdown(selectedStoreId!, startDate, endDate),
    queryFn: () => getPaymentBreakdown(selectedStoreId!, startDate, endDate),
    enabled: !!selectedStoreId,
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (!popularItems) return;

    const csvData = popularItems.items.map((item) => ({
      [t('item')]: item.menuItemName,
      [t('quantitySold')]: item.quantitySold,
      [t('revenue')]: item.totalRevenue,
      [t('orderCount')]: item.orderCount,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `popular-items-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="text-muted-foreground h-4 w-4" />
          <Select
            value={datePreset}
            onValueChange={(value) => setDatePreset(value as DateRangePreset)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('presets.today')}</SelectItem>
              <SelectItem value="week">{t('presets.week')}</SelectItem>
              <SelectItem value="month">{t('presets.month')}</SelectItem>
              <SelectItem value="custom">{t('presets.custom')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">{t('tabs.sales')}</TabsTrigger>
          <TabsTrigger value="popular">{t('tabs.popular')}</TabsTrigger>
          <TabsTrigger value="payments">{t('tabs.payments')}</TabsTrigger>
        </TabsList>

        {/* Sales Summary Tab */}
        <TabsContent value="sales" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalRevenue')}
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <Skeleton className="h-8 w-24" />
                ) : isErrorSales ? (
                  <p className="text-destructive text-sm">
                    {t('errorLoading')}
                  </p>
                ) : (
                  <div className="text-2xl font-bold">
                    ฿{salesSummary?.totalSales || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalOrders')}
                </CardTitle>
                <ShoppingCart className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <Skeleton className="h-8 w-24" />
                ) : isErrorSales ? (
                  <p className="text-destructive text-sm">
                    {t('errorLoading')}
                  </p>
                ) : (
                  <div className="text-2xl font-bold">
                    {salesSummary?.orderCount || 0}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('averageOrderValue')}
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <Skeleton className="h-8 w-24" />
                ) : isErrorSales ? (
                  <p className="text-destructive text-sm">
                    {t('errorLoading')}
                  </p>
                ) : (
                  <div className="text-2xl font-bold">
                    ฿{salesSummary?.averageOrderValue || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalVat')}
                </CardTitle>
                <DollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {isLoadingSales ? (
                  <Skeleton className="h-8 w-24" />
                ) : isErrorSales ? (
                  <p className="text-destructive text-sm">
                    {t('errorLoading')}
                  </p>
                ) : (
                  <div className="text-2xl font-bold">
                    ฿{salesSummary?.totalVat || '0.00'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Popular Items Tab */}
        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('popularItemsTitle')}</CardTitle>
                <CardDescription>
                  {t('popularItemsDescription')}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!popularItems}
              >
                <Download className="mr-2 h-4 w-4" />
                {t('exportCsv')}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPopular ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : isErrorPopular ? (
                <p className="text-destructive py-8 text-center">
                  {t('errorLoading')}
                </p>
              ) : (
                <>
                  {/* Bar Chart */}
                  <div className="mb-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={popularItems?.items || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="menuItemName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="quantitySold"
                          fill="#3B82F6"
                          name={t('quantitySold')}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Data Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('item')}</TableHead>
                        <TableHead className="text-right">
                          {t('quantitySold')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('revenue')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('orderCount')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {popularItems?.items.map((item) => (
                        <TableRow key={item.menuItemId}>
                          <TableCell className="font-medium">
                            {item.menuItemName}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantitySold}
                          </TableCell>
                          <TableCell className="text-right">
                            ฿{item.totalRevenue}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.orderCount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Breakdown Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentMethodsTitle')}</CardTitle>
              <CardDescription>
                {t('paymentMethodsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPayment ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : isErrorPayment ? (
                <p className="text-destructive py-8 text-center">
                  {t('errorLoading')}
                </p>
              ) : (
                <>
                  {/* Pie Chart */}
                  <div className="mb-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentBreakdown?.breakdown || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) =>
                            `${entry.paymentMethod}: ${entry.percentage.toFixed(1)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {paymentBreakdown?.breakdown.map((entry) => (
                            <Cell
                              key={entry.paymentMethod}
                              fill={
                                COLORS[entry.paymentMethod as PaymentMethod]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Data Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('paymentMethod')}</TableHead>
                        <TableHead className="text-right">
                          {t('amount')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('transactions')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('percentage')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentBreakdown?.breakdown.map((item) => (
                        <TableRow key={item.paymentMethod}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: COLORS[item.paymentMethod],
                                }}
                              />
                              {t(
                                `paymentMethods.${item.paymentMethod.toLowerCase()}`
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ฿{item.totalAmount}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.transactionCount}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
