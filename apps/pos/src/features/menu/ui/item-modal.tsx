'use client';

import { MenuItem } from '@/features/menu/types/menu-item.types';
import React from 'react';

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  console.log('📝 -> ItemModal -> item:', item);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-4 bg-white rounded shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute text-gray-600 top-2 right-2"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="mb-2 text-lg font-semibold">{item.name}</h2>
        {item.imageUrl && (
          <img
            // src={item.imageUrl}
            // TODO: Uncomment when imageUrl is available
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnVyZ2VyfGVufDB8fDB8fHww"
            alt={item.name}
            className="object-cover w-full h-40 rounded"
          />
        )}
        <p className="mt-2 text-sm text-gray-700">{item.description}</p>
        <p className="mt-1 font-medium">${item.basePrice}</p>
      </div>
    </div>
  );
}
