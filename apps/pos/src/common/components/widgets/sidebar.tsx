'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  ChefHat,
  MenuIcon,
  Settings,
  Users,
  BarChart3,
  CircleDot,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

// A small interface for sub-item
interface NavSubItem {
  label: string;
  href: string;
}

// A main item that might have sub items
interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string; // optional if sub-items exist
  subItems?: NavSubItem[];
}

// Each array in navSections is a separate "section" of nav items
const navSections: NavItem[][] = [
  [
    {
      label: 'Sale',
      icon: <ShoppingCart className="h-4 w-4" />,
      href: '/sale',
    },
    {
      label: 'Kitchen Display',
      icon: <ChefHat className="h-4 w-4" />,
      href: '/kds',
    },
  ],
  [
    {
      label: 'Menu',
      icon: <MenuIcon className="h-4 w-4" />,
      subItems: [
        { label: 'Items', href: '/menu/items' },
        { label: 'Categories', href: '/menu/categories' },
      ],
    },
    {
      label: 'Store',
      icon: <Settings className="h-4 w-4" />,
      subItems: [
        { label: 'Information', href: '/store/info' },
        { label: 'Settings', href: '/store/settings' },
        { label: 'Tables', href: '/store/tables' },
      ],
    },
  ],
  [
    {
      label: 'Members',
      icon: <Users className="h-4 w-4" />,
      href: '/members',
    },
    {
      label: 'Reports',
      icon: <BarChart3 className="h-4 w-4" />,
      subItems: [
        { label: 'Sales', href: '/reports/sales' },
        { label: 'Sales History', href: '/reports/history' },
        { label: 'Menu Items', href: '/reports/menu' },
      ],
    },
  ],
];

/** Checks if item or any of its sub-items matches current path */
function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.href && pathname.startsWith(item.href)) return true;
  if (item.subItems?.length) {
    return item.subItems.some((sub) => pathname.startsWith(sub.href));
  }
  return false;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  // Collapsed by default
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <aside
      className={cn(
        'flex h-[calc(100vh-64px)] flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle at top */}
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
          <div key={idx} className="py-2">
            {section.map((item) => {
              const active = isItemActive(item, pathname);
              const hasSub = item.subItems && item.subItems.length > 0;

              return (
                <div key={item.label} className="px-2 py-1">
                  {/* Single link or parent with sub items */}
                  {!hasSub ? (
                    <Link
                      href={item.href ?? '#'}
                      className={cn(
                        'flex items-center rounded p-2 hover:bg-gray-50',
                        active && 'bg-gray-200 font-medium',
                        // if collapsed, center the icon; otherwise, left align
                        collapsed ? 'justify-center' : ''
                      )}
                    >
                      {/* Icon */}
                      {item.icon}
                      {/* Label only if expanded */}
                      {!collapsed && <span className="ml-2">{item.label}</span>}
                    </Link>
                  ) : (
                    // Parent item with sub items
                    <div>
                      <div
                        className={cn(
                          'flex items-center rounded p-2 hover:bg-gray-50',
                          active && 'bg-gray-200 font-medium',
                          collapsed ? 'justify-center' : ''
                        )}
                      >
                        {item.icon}
                        {!collapsed && (
                          <span className="ml-2">{item.label}</span>
                        )}
                      </div>

                      {/* sub items, shown only if not collapsed */}
                      {!collapsed && (
                        <ul className="mt-1 space-y-1 pl-8">
                          {item.subItems?.map((sub) => {
                            const subActive = pathname.startsWith(sub.href);
                            return (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={cn(
                                    'flex items-center rounded px-2 py-1 hover:bg-gray-100',
                                    subActive && 'bg-gray-200 font-medium'
                                  )}
                                >
                                  <CircleDot className="mr-2 h-3 w-3 text-gray-500" />
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* line bar between sections, except the last */}
            {idx < navSections.length - 1 && <hr className="my-2 border-t" />}
          </div>
        ))}
      </nav>

      {/* Optional bottom version/info or disclaimers */}
      <div className="border-t p-2 text-center text-xs text-gray-400">
        v1.0.0
      </div>
    </aside>
  );
}
