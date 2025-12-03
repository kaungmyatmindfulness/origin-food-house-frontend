'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ShoppingCart,
  ChefHat,
  UtensilsCrossed,
  Settings,
  UserCog,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Info,
  List,
  Grid3X3,
  DollarSign,
  History,
  QrCode,
  Store,
  Printer,
  Building2,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/components/button';
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
      // Section 1: Daily Operations (POS & Kitchen)
      [
        {
          labelKey: 'sale',
          icon: <ShoppingCart className="text-muted-foreground h-4 w-4" />,
          href: '/hub/sale',
        },
        {
          labelKey: 'kitchenDisplay',
          icon: <ChefHat className="text-muted-foreground h-4 w-4" />,
          href: '/hub/kitchen',
        },
      ],
      // Section 2: Catalog Management (Menu & Tables)
      [
        {
          labelKey: 'menu',
          icon: <UtensilsCrossed className="text-muted-foreground h-4 w-4" />,
          href: '/hub/menu',
        },
        {
          labelKey: 'tables',
          icon: <Grid3X3 className="text-muted-foreground h-4 w-4" />,
          subItems: [
            {
              labelKey: 'manage',
              href: '/hub/tables/manage',
              icon: <List className="text-muted-foreground h-4 w-4" />,
            },
            {
              labelKey: 'qrCodes',
              href: '/hub/tables/qr-code',
              icon: <QrCode className="text-muted-foreground h-4 w-4" />,
            },
          ],
        },
      ],
      // Section 3: Store Administration
      [
        {
          labelKey: 'store',
          icon: <Building2 className="text-muted-foreground h-4 w-4" />,
          subItems: [
            {
              labelKey: 'information',
              href: '/hub/store/information',
              icon: <Info className="text-muted-foreground h-4 w-4" />,
            },
            {
              labelKey: 'settings',
              href: '/hub/store/settings',
              icon: <Settings className="text-muted-foreground h-4 w-4" />,
            },
            {
              labelKey: 'printSettings',
              href: '/hub/store/print-settings',
              icon: <Printer className="text-muted-foreground h-4 w-4" />,
            },
          ],
        },
        {
          labelKey: 'storePersonnel',
          icon: <UserCog className="text-muted-foreground h-4 w-4" />,
          href: '/hub/store-personnel',
        },
      ],
      // Section 4: Analytics & Reporting
      [
        {
          labelKey: 'reports',
          icon: <BarChart3 className="text-muted-foreground h-4 w-4" />,
          subItems: [
            {
              labelKey: 'sales',
              href: '/hub/reports/sales',
              icon: <DollarSign className="text-muted-foreground h-4 w-4" />,
            },
            {
              labelKey: 'salesHistory',
              href: '/hub/reports/history',
              icon: <History className="text-muted-foreground h-4 w-4" />,
            },
            {
              labelKey: 'menuItems',
              href: '/hub/reports/menu',
              icon: <ClipboardList className="text-muted-foreground h-4 w-4" />,
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
            'flex min-h-9 items-center rounded px-3 py-2 text-sm transition-colors',
            'hover:bg-primary hover:text-primary-foreground [&:hover_svg]:text-primary-foreground',
            collapsed ? 'w-auto' : 'w-full'
          )}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="text-muted-foreground mr-2 h-4 w-4" />
              <span>{t('collapse')}</span>
            </>
          )}
        </button>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto text-sm">
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
                        'flex min-h-9 items-center gap-2 rounded px-3 py-2 transition-colors',
                        'hover:bg-primary hover:text-primary-foreground [&:hover_svg]:text-primary-foreground',
                        active &&
                          'bg-primary text-primary-foreground [&_svg]:text-primary-foreground font-medium',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span>{t(item.labelKey)}</span>}
                    </Link>
                  );
                }

                return (
                  <div key={item.labelKey} className="px-2 py-1">
                    <div
                      className={cn(
                        'flex min-h-9 items-center gap-2 rounded px-3 py-2',
                        active && 'font-medium',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span>{t(item.labelKey)}</span>}
                    </div>
                    {!collapsed && (
                      <ul className="mt-1 space-y-0.5 pl-6">
                        {item.subItems.map((sub) => {
                          const subPath = pathname.startsWith(sub.href);
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={cn(
                                  'flex min-h-8 items-center gap-2 rounded px-3 py-1.5 transition-colors',
                                  'hover:bg-primary hover:text-primary-foreground [&:hover_svg]:text-primary-foreground',
                                  subPath &&
                                    'bg-primary text-primary-foreground [&_svg]:text-primary-foreground font-medium'
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

      {/* Footer: Switch Store & Language Switcher */}
      <div className="border-t p-2">
        <div className="flex flex-col gap-1">
          {/* Switch Store */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-9 w-full gap-2',
              collapsed ? 'justify-center px-2' : 'justify-start'
            )}
            asChild
          >
            <Link href="/store/choose">
              <Store className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate text-sm">{t('switchStore')}</span>
              )}
            </Link>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher collapsed={collapsed} />
        </div>
      </div>

      <div className="border-t p-2 text-center text-xs text-gray-400">
        v0.0.1
      </div>
    </motion.aside>
  );
}
