/**
 * Report service - API calls for reports
 */

import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type {
  SalesSummaryDto,
  PopularItemsDto,
  PaymentBreakdownDto,
  OrderStatusDistributionDto,
} from '../types/report.types';

const BASE_PATH = '/reports';

/**
 * Get sales summary report
 */
export async function getSalesSummary(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesSummaryDto> {
  const res = await apiFetch<SalesSummaryDto>(
    {
      path: `${BASE_PATH}/sales-summary`,
      query: {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
    { method: 'GET' }
  );
  return unwrapData(res, 'Failed to fetch sales summary');
}

/**
 * Get popular items report
 */
export async function getPopularItems(
  storeId: string,
  limit: number,
  startDate: Date,
  endDate: Date
): Promise<PopularItemsDto> {
  const res = await apiFetch<PopularItemsDto>(
    {
      path: `${BASE_PATH}/popular-items`,
      query: {
        storeId,
        limit: limit.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
    { method: 'GET' }
  );
  return unwrapData(res, 'Failed to fetch popular items');
}

/**
 * Get payment breakdown report
 */
export async function getPaymentBreakdown(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<PaymentBreakdownDto> {
  const res = await apiFetch<PaymentBreakdownDto>(
    {
      path: `${BASE_PATH}/payment-breakdown`,
      query: {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
    { method: 'GET' }
  );
  return unwrapData(res, 'Failed to fetch payment breakdown');
}

/**
 * Get order status distribution report
 */
export async function getOrderStatusReport(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<OrderStatusDistributionDto[]> {
  const res = await apiFetch<OrderStatusDistributionDto[]>(
    {
      path: `${BASE_PATH}/order-status-distribution`,
      query: {
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    },
    { method: 'GET' }
  );
  return unwrapData(res, 'Failed to fetch order status distribution');
}
