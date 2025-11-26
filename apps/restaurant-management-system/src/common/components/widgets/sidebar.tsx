'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ShoppingCart,
  ChefHat,
  MenuIcon,
  Settings,
  Users,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Info,
  List,
  LayoutGrid,
  DollarSign,
  History,
  QrCode,
  Store,
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { LanguageSwitcher } from '@/common/components/LanguageSwitcher';

interface NavSubItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  labelKey: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: NavSubItem[];
}

const useNavSections = () => {
  return React.useMemo<NavItem[][]>(
    () => [
      [
        {
          labelKey: 'sale',
          icon: <ShoppingCart className="mr-2 h-5 w-5 text-gray-500" />,
          href: '/hub/sale',
        },
        {
          labelKey: 'kitchenDisplay',
          icon: <ChefHat className="mr-2 h-5 w-5 text-gray-500" />,
          href: '/hub/kitchen',
        },
      ],
      [
        {
          labelKey: 'menu',
          icon: <MenuIcon className="mr-2 h-5 w-5 text-gray-500" />,
          href: '/hub/menu',
        },
        {
          labelKey: 'store',
          icon: <Settings className="mr-2 h-5 w-5 text-gray-500" />,
          subItems: [
            {
              labelKey: 'choose',
              href: '/store/choose',
              icon: <Store className="mr-2 h-5 w-5 text-gray-500" />,
            },
            {
              labelKey: 'information',
              href: '/hub/store/information',
              icon: <Info className="mr-2 h-5 w-5 text-gray-500" />,
            },
            {
              labelKey: 'settings',
              href: '/hub/store/settings',
              icon: <Settings className="mr-2 h-5 w-5 text-gray-500" />,
            },
          ],
        },

        {
          labelKey: 'tables',
          icon: <LayoutGrid className="mr-2 h-5 w-5 text-gray-500" />,
          subItems: [
            {
              labelKey: 'manage',
              href: '/hub/tables/manage',
              icon: <List className="mr-2 h-5 w-5 text-gray-500" />,
            },
            {
              labelKey: 'qrCodes',
              href: '/hub/tables/qr-code',
              icon: <QrCode className="mr-2 h-5 w-5 text-gray-500" />,
            },
          ],
        },
      ],
      [
        {
          labelKey: 'storePersonnel',
          icon: <Users className="mr-2 h-5 w-5 text-gray-500" />,
          href: '/hub/store-personnel',
        },
        {
          labelKey: 'reports',
          icon: <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />,
          subItems: [
            {
              labelKey: 'sales',
              href: '/hub/reports/sales',
              icon: <DollarSign className="mr-2 h-5 w-5 text-gray-500" />,
            },
            {
              labelKey: 'salesHistory',
              href: '/hub/reports/history',
              icon: <History className="mr-2 h-5 w-5 text-gray-500" />,
            },
            {
              labelKey: 'menuItems',
              href: '/hub/reports/menu',
              icon: <List className="mr-2 h-5 w-5 text-gray-500" />,
            },
          ],
        },
      ],
    ],
    []
  );
};

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href && pathname.startsWith(item.href)) {
    return true;
  }
  return item.subItems?.some((sub) => pathname.startsWith(sub.href)) || false;
}

const sidebarVariants: Variants = {
  collapsed: {
    width: '4rem',
    transition: { duration: 0.3 },
  },
  expanded: {
    width: '16rem',
    transition: { duration: 0.3 },
  },
};

export function DashboardSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const navSections = useNavSections();

  return (
    <motion.aside
      className="fixed top-[60px] bottom-0 left-0 z-40 flex flex-col border-r bg-white"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={collapsed ? 'collapsed' : 'expanded'}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-center border-b p-2">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            'flex min-h-11 items-center rounded px-3 py-3 text-base transition-colors hover:bg-gray-50 active:bg-gray-100',
            collapsed ? 'w-auto' : 'w-full'
          )}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <>
              <ChevronLeft className="mr-2 h-5 w-5" />
              <span>{t('collapse')}</span>
            </>
          )}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto text-base">
        {navSections.map((section, idx) => (
          <React.Fragment key={idx}>
            <div className="py-2">
              {section.map((item) => {
                const active = isItemActive(item, pathname);
                if (!item.subItems) {
                  return (
                    <Link
                      key={item.labelKey}
                      href={item.href ?? '#'}
                      className={cn(
                        'flex min-h-11 items-center rounded px-3 py-3 hover:bg-gray-50 active:bg-gray-100',
                        active && 'bg-gray-200 font-medium',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span className="ml-2">{t(item.labelKey)}</span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div key={item.labelKey} className="px-2 py-1">
                    <div
                      className={cn(
                        'flex min-h-11 items-center rounded px-3 py-3 hover:bg-gray-50',
                        active && 'bg-gray-200 font-medium',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span className="ml-2">{t(item.labelKey)}</span>
                      )}
                    </div>
                    {!collapsed && (
                      <ul className="mt-1 space-y-1 pl-6">
                        {item.subItems.map((sub) => {
                          const subPath = pathname.startsWith(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  'flex min-h-11 items-center rounded px-3 py-3 hover:bg-gray-100 active:bg-gray-200',
                                  subPath && 'bg-gray-200 font-medium'
                                )}
                              >
                                {sub.icon}
                                {t(sub.labelKey)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            {idx < navSections.length - 1 && <hr className="my-2 border-t" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Language Switcher */}
      {!collapsed && (
        <div className="border-t p-2">
          <LanguageSwitcher />
        </div>
      )}

      <div className="border-t p-2 text-center text-xs text-gray-400">
        v0.0.1
      </div>
    </motion.aside>
  );
}
