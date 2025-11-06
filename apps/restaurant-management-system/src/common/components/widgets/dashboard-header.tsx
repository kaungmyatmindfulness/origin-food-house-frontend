'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  Check,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useAuthStore,
  selectSelectedStoreId,
} from '@/features/auth/store/auth.store';
import {
  logoutFromAuth0,
  isAuth0Authenticated,
} from '@/features/auth/services/auth0.service';
import { getCurrentUser } from '@/features/user/services/user.service';
import { getStoreDetails } from '@/features/store/services/store.service';
import { userKeys } from '@/features/user/queries/user.keys';
import { storeKeys } from '@/features/store/queries/store.keys';
import { NotificationPopover } from './notification-popover';
import { Popover, PopoverTrigger } from '@repo/ui/components/popover';
import { Button } from '@repo/ui/components/button';
import { Avatar, AvatarFallback } from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Badge } from '@repo/ui/components/badge';
import { getInitials } from '@/utils/string-utils';

export function DashboardHeader() {
  const router = useRouter();
  const { clearAuth, setSelectedStore } = useAuthStore();
  const selectedStoreId = useAuthStore(selectSelectedStoreId);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: userKeys.currentUser(selectedStoreId ?? undefined),
    queryFn: () => getCurrentUser(selectedStoreId ?? undefined),
    enabled: !!selectedStoreId,
  });

  const { data: currentStore } = useQuery({
    queryKey: storeKeys.detail(selectedStoreId ?? ''),
    queryFn: () => getStoreDetails(selectedStoreId ?? ''),
    enabled: !!selectedStoreId,
  });

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

  function handleStoreChange(storeId: string) {
    setSelectedStore(storeId);
    window.location.reload();
  }

  const userStores = currentUser?.userStores ?? [];
  const hasMultipleStores = userStores.length > 1;

  return (
    <>
      <header className="bg-background fixed top-0 right-0 left-0 z-10 flex h-15 items-center justify-between border-b px-4 shadow-sm md:px-6">
        {/* Left: Logo + Store Selector */}
        <div className="flex items-center gap-4">
          <Link href="/hub-sales">
            <Image src="/logo.svg" alt="Logo" width={64} height={32} />
          </Link>

          {/* Store Selector */}
          {currentStore && (
            <>
              {hasMultipleStores ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden h-9 gap-2 md:flex"
                      aria-label="Select store"
                      aria-haspopup="menu"
                    >
                      <span className="max-w-[200px] truncate text-sm font-medium">
                        {currentStore.information.name}
                      </span>
                      <ChevronDown className="text-muted-foreground h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[240px]">
                    <DropdownMenuLabel className="text-muted-foreground text-xs">
                      Switch Store
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userStores.map((userStore) => (
                      <DropdownMenuItem
                        key={userStore.store.id}
                        onSelect={() => handleStoreChange(userStore.store.id)}
                      >
                        <div className="flex w-full items-center gap-2">
                          {userStore.store.id === selectedStoreId && (
                            <Check className="text-primary h-4 w-4" />
                          )}
                          <span className="flex-1 truncate">
                            {userStore.store.information.name}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-foreground hidden text-sm font-medium md:inline-block">
                  {currentStore.information.name}
                </span>
              )}
            </>
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
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
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
                  className="h-9 gap-2 px-2"
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
                <DropdownMenuItem onSelect={() => router.push('/hub/account')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Account Settings
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
