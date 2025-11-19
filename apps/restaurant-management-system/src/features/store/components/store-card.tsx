'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { UserStore } from '@/features/user/types/user.types';

interface StoreCardProps {
  userStore: UserStore;
  onSelect: (storeId: string) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  userStore,
  onSelect,
  isLoading = false,
  isSelected = false,
}) => {
  const { store, role } = userStore;
  const { information } = store;
  const isDisabled = isLoading;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(store.id)}
        disabled={isDisabled}
        className={cn(
          'bg-card focus:ring-ring w-full cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:shadow-xl focus:ring-2 focus:outline-none',
          'relative text-left',
          isDisabled && 'cursor-not-allowed opacity-50 hover:shadow-sm'
        )}
        aria-label={`Select store ${information.name}, role ${role}`}
      >
        {isLoading && isSelected && (
          <div className="bg-card/80 absolute inset-0 flex items-center justify-center rounded-lg">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
        )}
        <div className="mb-2">
          <h3 className="text-foreground text-lg font-semibold">
            {information.name}
          </h3>
          {information.address && (
            <p className="text-muted-foreground text-sm">
              {information.address}
            </p>
          )}
          {information.phone && (
            <p className="text-muted-foreground text-sm">{information.phone}</p>
          )}
        </div>
        <div className="mt-2">
          <span className="text-primary text-xs font-medium uppercase">
            {role}
          </span>
        </div>
      </button>
    </li>
  );
};
