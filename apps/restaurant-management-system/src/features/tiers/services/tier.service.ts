import { apiFetch, unwrapData } from '@/utils/apiFetch';
import type { TierUsageResponse } from '../types/tier.types';

/**
 * Fetches tier usage for a specific store
 */
export async function getTierUsage(
  storeId: string
): Promise<TierUsageResponse> {
  const res = await apiFetch<TierUsageResponse>(`/tiers/${storeId}/usage`);

  return unwrapData(res, 'Failed to fetch tier usage');
}
