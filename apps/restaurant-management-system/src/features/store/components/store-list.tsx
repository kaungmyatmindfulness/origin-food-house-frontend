'use client';

import React from 'react';
import { motion } from 'motion/react';
import { StoreCard } from '@/features/store/components/store-card';
import { UserStore } from '@/features/user/types/user.types';

interface StoreListProps {
  userStores: UserStore[];
  onSelect: (storeId: string) => void;
  isLoading?: boolean;
  selectedStoreId?: string | null;
}

export function StoreList({
  userStores,
  onSelect,
  isLoading = false,
  selectedStoreId = null,
}: StoreListProps) {
  return (
    <motion.ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      // AnimatePresence won't apply here by default unless we do more advanced toggling
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
    >
      {userStores.map((userStore) => (
        <StoreCard
          key={userStore.id}
          userStore={userStore}
          onSelect={onSelect}
          isLoading={isLoading}
          isSelected={selectedStoreId === userStore.store.id}
        />
      ))}
    </motion.ul>
  );
}
