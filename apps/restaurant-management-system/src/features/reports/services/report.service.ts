/**
 * Report Service
 *
 * Service layer for report-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type {
  SalesSummaryDto,
  PopularItemsDto,
  PaymentBreakdownDto,
  OrderStatusDistributionDto,
} from '../types/report.types';

/**
 * Get sales summary report
 */
export async function getSalesSummary(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesSummaryDto> {
  const { data, error, response } = await apiClient.GET(
    '/reports/sales-summary',
    {
      params: {
        query: {
          storeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch sales summary',
      response.status
    );
  }

  return data.data as SalesSummaryDto;
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
  const { data, error, response } = await apiClient.GET(
    '/reports/popular-items',
    {
      params: {
        query: {
          storeId,
          limit: limit.toString(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch popular items',
      response.status
    );
  }

  return data.data as PopularItemsDto;
}

/**
 * Get payment breakdown report
 */
export async function getPaymentBreakdown(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<PaymentBreakdownDto> {
  const { data, error, response } = await apiClient.GET(
    '/reports/payment-breakdown',
    {
      params: {
        query: {
          storeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch payment breakdown',
      response.status
    );
  }

  return data.data as PaymentBreakdownDto;
}

/**
 * Get order status distribution report
 */
export async function getOrderStatusReport(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<OrderStatusDistributionDto[]> {
  const { data, error, response } = await apiClient.GET(
    '/reports/order-status-distribution',
    {
      params: {
        query: {
          storeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
    }
  );

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch order status distribution',
      response.status
    );
  }

  return data.data as OrderStatusDistributionDto[];
}
