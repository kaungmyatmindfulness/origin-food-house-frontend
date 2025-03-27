'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AppSearchPopover } from './app-search-popover';
import { NotificationPopover } from './notification-popover';
import { AccountPopover } from './account-popover';
import { Input } from '@repo/ui/components/input';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { Button } from '@repo/ui/components/button';

/**
 * DashboardHeader component:
 * - A logo linking to /dashboard
 * - A center search input + icon
 * - Notification bell
 * - Account user icon
 *
 * Each popover is uncontrolled:
 * we use <Popover> ... <PopoverTrigger> ... <PopoverContent>
 */
export function DashboardHeader() {
  const { clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    // e.g. push to /login if desired
  }

  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      {/* Logo */}
      <div>
        <Link href="/dashboard" className="text-lg font-bold text-gray-800">
          <Image src="/logo.svg" alt="Logo" width={64} height={32} />
        </Link>
      </div>

      {/* Center: Search input & icon */}
      <div className="relative hidden items-center space-x-2 md:flex">
        <Input placeholder="Search..." className="w-72" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="p-2"
              aria-label="Open search popover"
            >
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <AppSearchPopover />
        </Popover>
      </div>

      {/* Right: Notification & Account */}
      <div className="flex items-center space-x-4">
        {/* Notification popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" aria-label="Open notifications">
              <Bell className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <NotificationPopover />
        </Popover>

        {/* Account popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" aria-label="Open account menu">
              <User className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <AccountPopover onLogout={handleLogout} />
        </Popover>
      </div>
    </header>
  );
}
