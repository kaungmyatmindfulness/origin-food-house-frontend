'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface NavSubItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: NavSubItem[];
}

// Sample nav structure
const navSections: NavItem[][] = [
  [
    {
      label: 'Sale',
      icon: <ShoppingCart className="h-4 w-4" />,
      href: '/hub/sale',
    },
    {
      label: 'Kitchen Display',
      icon: <ChefHat className="h-4 w-4" />,
      href: '/hub/kds',
    },
  ],
  [
    {
      label: 'Menu',
      icon: <MenuIcon className="h-4 w-4" />,
      href: '/hub/menu',
    },
    {
      label: 'Store',
      icon: <Settings className="h-4 w-4" />,
      subItems: [
        {
          label: 'Information',
          href: '/hub/store/information',
          icon: <Info className="mr-2 h-3 w-3 text-gray-500" />,
        },
        {
          label: 'Settings',
          href: '/hub/store/settings',
          icon: <Settings className="mr-2 h-3 w-3 text-gray-500" />,
        },
        {
          label: 'Tables',
          href: '/hub/store/tables',
          icon: <LayoutGrid className="mr-2 h-3 w-3 text-gray-500" />,
        },
      ],
    },
  ],
  [
    {
      label: 'Members',
      icon: <Users className="h-4 w-4" />,
      href: '/hub/members',
    },
    {
      label: 'Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      subItems: [
        {
          label: 'Sales',
          href: '/hub/reports/sales',
          icon: <DollarSign className="mr-2 h-3 w-3 text-gray-500" />,
        },
        {
          label: 'Sales History',
          href: '/hub/reports/history',
          icon: <History className="mr-2 h-3 w-3 text-gray-500" />,
        },
        {
          label: 'Menu Items',
          href: '/hub/reports/menu',
          icon: <List className="mr-2 h-3 w-3 text-gray-500" />,
        },
      ],
    },
  ],
];

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href && pathname.startsWith(item.href)) {
    return true;
  }
  return item.subItems?.some((sub) => pathname.startsWith(sub.href)) || false;
}

// Matches the Layout approach: 4rem collapsed, 16rem expanded
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

  return (
    <motion.aside
      className="fixed top-[64px] bottom-0 left-0 z-20 flex flex-col border-r bg-white"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={collapsed ? 'collapsed' : 'expanded'}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-center border-b p-2">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn(
            'flex items-center rounded px-2 py-1 text-sm transition-colors hover:bg-gray-50',
            collapsed ? 'w-auto' : 'w-full'
          )}
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span>Collapse</span>
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
                      key={item.label}
                      href={item.href ?? '#'}
                      className={cn(
                        'flex items-center rounded p-2 hover:bg-gray-50',
                        active && 'bg-gray-200 font-medium',
                        collapsed ? 'justify-center' : 'pl-2'
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-2">{item.label}</span>}
                    </Link>
                  );
                }
                // sub items
                const subActive = active && !collapsed;
                return (
                  <div key={item.label} className="px-2 py-1">
                    <div
                      className={cn(
                        'flex items-center rounded p-2 hover:bg-gray-50',
                        active && 'bg-gray-200 font-medium',
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span className="ml-2">{item.label}</span>}
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
                                  'flex items-center rounded px-2 py-1 hover:bg-gray-100',
                                  subPath && 'bg-gray-200 font-medium'
                                )}
                              >
                                {sub.icon}
                                {sub.label}
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

      <div className="border-t p-2 text-center text-xs text-gray-400">
        v0.0.1
      </div>
    </motion.aside>
  );
}
