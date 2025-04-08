'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@repo/ui/components/popover';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { MenuItem } from '@/features/menu/types/menu-item.types';

interface ItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const handleCardClick = () => onSelect(item);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Editing item:', item.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Deleting item:', item.id);
  };

  return (
    <motion.div
      className="cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      <Card className="relative gap-2 py-3">
        {/* Title + Popover row */}
        <div className="flex items-center justify-between px-3">
          <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="p-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1">
              <div className="flex flex-col text-sm">
                <button
                  className="flex items-center px-2 py-1 hover:bg-gray-100"
                  onClick={handleEdit}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </button>
                <button
                  className="flex items-center px-2 py-1 text-red-600 hover:bg-gray-100"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <img
          src={item.imageUrl || '/no-image.svg'}
          alt={item.name}
          className="h-32 w-full border-t border-b border-gray-200 object-cover"
        />

        {/* Description + Price */}
        <div className="px-3 py-2">
          <p className="line-clamp-2 text-xs text-gray-600">
            {item.description}
          </p>
          <p className="mt-2 text-sm font-medium text-gray-800">
            ${item.basePrice}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
