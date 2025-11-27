/**
 * Tier Service
 *
 * Service layer for tier-related API operations.
 * Uses openapi-fetch for type-safe API calls.
 */

import { apiClient, ApiError } from '@/utils/apiFetch';
import type { TierUsageResponse } from '../types/tier.types';

/**
 * Fetches tier usage for a specific store
 */
export async function getTierUsage(
  storeId: string
): Promise<TierUsageResponse> {
  const { data, error, response } = await apiClient.GET('/tiers/{storeId}/usage', {
    params: { path: { storeId } },
  });

  if (error || !data?.data) {
    throw new ApiError(
      data?.message || 'Failed to fetch tier usage',
      response.status
    );
  }

  return data.data as TierUsageResponse;
}
