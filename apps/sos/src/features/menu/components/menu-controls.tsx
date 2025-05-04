// src/features/menu/components/menu-controls.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Search } from 'lucide-react';

// Re-define minimal category type needed here or import if available globally
interface CategoryInfo {
  id: string;
  name: string;
}

interface MenuControlsProps {
  categories: CategoryInfo[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onCategorySelect: (categoryId: string) => void;
  isSearchFocused: boolean;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  showStickyHeader: boolean; // To adjust sticky position
}

export function MenuControls({
  categories,
  searchTerm,
  onSearchTermChange,
  onCategorySelect,
  isSearchFocused,
  onSearchFocus,
  onSearchBlur,
  showStickyHeader,
}: MenuControlsProps) {
  return (
    <div
      className={`sticky z-30 -mx-4 mb-6 flex flex-col items-center gap-4 bg-gray-50 px-4 py-3 transition-all duration-300 sm:flex-row ${showStickyHeader ? 'top-[70px]' : 'top-0'}`} // Adjust top based on header visibility
    >
      {/* Category Dropdown */}
      <motion.div
        className={`w-full flex-grow sm:w-64 sm:flex-grow-0 ${isSearchFocused ? 'hidden sm:invisible sm:block sm:opacity-0' : 'visible opacity-100'}`}
        animate={{
          opacity: isSearchFocused ? 0 : 1,
          visibility: isSearchFocused ? 'hidden' : 'visible',
        }}
        transition={{ duration: 0.2 }}
      >
        <Select onValueChange={onCategorySelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      {/* Search Input */}
      <motion.div className="relative w-full sm:flex-grow" layout>
        <Search className="text-muted-foreground absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Search menu items..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
        />
      </motion.div>
    </div>
  );
}
