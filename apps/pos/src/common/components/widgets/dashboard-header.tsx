'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  logoutFromAuth0,
  isAuth0Authenticated,
} from '@/features/auth/services/auth0.service';
import { NotificationPopover } from './notification-popover';
import { AccountPopover } from './account-popover';
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Check if user is authenticated with Auth0
      const isAuth0User = await isAuth0Authenticated();

      if (isAuth0User) {
        // Logout from Auth0 (also logs out from backend)
        await logoutFromAuth0();
      } else {
        // Traditional logout - just clear local auth state
        clearAuth();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear auth and redirect
      clearAuth();
      window.location.href = '/login';
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-10 flex h-15 items-center justify-between border-b bg-white p-4 shadow-sm">
        {/* Logo */}
        <div>
          <Link href="/hub-sales" className="text-lg font-bold text-gray-800">
            <Image src="/logo.svg" alt="Logo" width={64} height={32} />
          </Link>
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
      <div className="h-15"></div>
    </>
  );
}
