'use client';

import { useMemo } from 'react';

import {
  createStashStore,
  selectStashedOrders,
  selectStashCount,
  selectHasStashedOrders,
} from '../store/stash.store';

import type { StashStore } from '../store/stash.store';

/**
 * Map to cache store instances per storeId
 * This ensures we reuse the same store instance for the same storeId
 */
const storeInstances = new Map<string, StashStore>();

/**
 * Get or create a stash store for a specific store ID
 */
function getStashStore(storeId: string): StashStore {
  const existing = storeInstances.get(storeId);
  if (existing) {
    return existing;
  }

  const newStore = createStashStore(storeId);
  storeInstances.set(storeId, newStore);
  return newStore;
}

/**
 * Hook to access the stash store for a specific store ID
 *
 * This creates a stable store instance per storeId that persists
 * across component re-renders. The store is memoized based on storeId.
 *
 * @param storeId - The store ID to scope the stash storage
 */
export function useStashStore(storeId: string) {
  // Get or create the store instance
  const store = useMemo(() => getStashStore(storeId), [storeId]);

  // Get state and actions
  const stashedOrders = store(selectStashedOrders);
  const stashCount = store(selectStashCount);
  const hasStashedOrders = store(selectHasStashedOrders);
  const stashOrder = store((state) => state.stashOrder);
  const restoreOrder = store((state) => state.restoreOrder);
  const deleteStashedOrder = store((state) => state.deleteStashedOrder);
  const clearAllStashedOrders = store((state) => state.clearAllStashedOrders);

  return {
    // State
    stashedOrders,
    stashCount,
    hasStashedOrders,

    // Actions
    stashOrder,
    restoreOrder,
    deleteStashedOrder,
    clearAllStashedOrders,
  };
}
