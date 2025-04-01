'use client';

import { MenuItem } from '@/features/menu/types/menu-item.types';
import React from 'react';

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded bg-white p-4 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="mb-2 text-lg font-semibold">{item.name}</h2>
        {item.imageKey && (
          <img
            // src={item.imageUrl}
            // TODO: Uncomment when imageUrl is available
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww"
            alt={item.name}
            className="h-40 w-full rounded object-cover"
          />
        )}
        <p className="mt-2 text-sm text-gray-700">{item.description}</p>
        <p className="mt-1 font-medium">${item.basePrice.toFixed(2)}</p>
      </div>
    </div>
  );
}
