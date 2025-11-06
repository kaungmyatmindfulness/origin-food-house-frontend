'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';

interface MenuSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onKeyboardShortcut?: () => void;
}

export function MenuSearchBar({
  value,
  onChange,
  placeholder = 'Search menu items...',
  onKeyboardShortcut,
}: MenuSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        onKeyboardShortcut?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyboardShortcut]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10 pl-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <span className="text-muted-foreground absolute top-1/2 right-3 hidden -translate-y-1/2 text-xs sm:block">
        {!value && '⌘K'}
      </span>
    </div>
  );
}
