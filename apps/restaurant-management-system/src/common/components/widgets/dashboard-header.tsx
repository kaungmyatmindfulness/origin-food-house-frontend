'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import { useState } from 'react';

import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import {
  logoutFromAuth0,
  isAuth0Authenticated,
} from '@/features/auth/services/auth0.service';
import { $api } from '@/utils/apiFetch';
import { API_PATHS } from '@/utils/api-paths';
import { NotificationPopover } from './notification-popover';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { Button } from '@repo/ui/components/button';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Badge } from '@repo/ui/components/badge';
import { getInitials } from '@/utils/string-utils';

import type { CurrentUserData } from '@/features/user/types/user.types';
import type { GetStoreDetailsResponseDto } from '@/features/store/types/store.types';

export function DashboardHeader() {
  const { clearAuth } = useAuthStore();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Fetch current user data with store context.
   *
   * Note: Using type cast because the API returns additional fields (userStores, selectedStoreRole)
   * that are not yet documented in the OpenAPI spec.
   * TODO: Remove cast once backend adds these fields to UserProfileResponseDto.
   */
  const { data: currentUserResponse } = $api.useQuery(
    'get',
    API_PATHS.userProfile,
    { params: { query: { storeId: selectedStoreId ?? undefined } } },
    { enabled: !!selectedStoreId }
  );
  const currentUser = currentUserResponse?.data as CurrentUserData | undefined;

  /**
   * Fetch store details for header display.
   *
   * Note: Using type cast because the API returns additional fields (logoUrl, coverImageUrl, tier)
   * that are not yet documented in the OpenAPI spec.
   * TODO: Remove cast once backend adds these fields to GetStoreDetailsResponseDto.
   */
  const { data: currentStoreResponse } = $api.useQuery(
    'get',
    API_PATHS.store,
    { params: { path: { id: selectedStoreId! } } },
    { enabled: !!selectedStoreId }
  );
  const currentStore = currentStoreResponse?.data as
    | GetStoreDetailsResponseDto
    | undefined;

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const isAuth0User = await isAuth0Authenticated();

      if (isAuth0User) {
        await logoutFromAuth0();
      } else {
        clearAuth();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="bg-background fixed top-0 right-0 left-0 z-50 flex h-15 items-center justify-between border-b px-4 shadow-sm md:px-6">
        {/* Left: Logo + Store Info */}
        <div className="flex items-center gap-4">
          <Link href="/hub/sales">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={64}
              height={32}
              priority
              style={{ height: 'auto' }}
            />
          </Link>

          {currentStore && (
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-foreground text-sm font-medium">
                {currentStore.information?.name ?? 'Store'}
              </span>
            </div>
          )}
        </div>

        {/* Right: Notifications + Account */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <NotificationPopover />
          </Popover>

          {/* Account Menu with Avatar */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 gap-2 px-3"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                >
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline-block">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {/* User Info Header */}
                <div className="px-2 py-2">
                  <p className="text-foreground text-sm font-medium">
                    {currentUser.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {currentUser.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                {/* Role Badge */}
                {currentUser.selectedStoreRole && (
                  <>
                    <DropdownMenuItem disabled>
                      <Badge variant="outline" className="text-xs">
                        {currentUser.selectedStoreRole}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Account Actions */}
                <DropdownMenuItem asChild>
                  <Link href="/hub/account">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <div className="h-15"></div>
    </>
  );
}
