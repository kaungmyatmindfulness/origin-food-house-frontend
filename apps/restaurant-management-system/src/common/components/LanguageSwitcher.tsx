'use client';

/**
 * Language switcher component using Zustand for SSG compatibility.
 * Replaces the previous cookie-based approach that required server refresh.
 */
import { Globe } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useLocaleStore, selectLocale } from '@/i18n/locale.store';

interface LanguageSwitcherProps {
  collapsed?: boolean;
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const locale = useLocaleStore(selectLocale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-9 w-full gap-2',
            collapsed ? 'justify-center px-2' : 'justify-start'
          )}
        >
          <Globe className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="truncate text-sm">{localeNames[locale]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={collapsed ? 'center' : 'end'} side="top">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="cursor-pointer gap-2"
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
            {loc === locale && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
