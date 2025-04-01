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
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  List,
  LayoutGrid,
  DollarSign,
  History,
} from 'lucide-react';
import { motion, Variants } from 'motion/react';
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
          href: '/hub/store/info',
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
  if (item.href && pathname.startsWith(item.href)) return true;
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

const sectionVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

const subItemsContainer: Variants = {
  hidden: { height: 0, opacity: 0, transition: { duration: 0.25 } },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.25, staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const subItemVariant: Variants = {
  hidden: { opacity: 0, y: -3 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function SidebarToggle({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
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
  );
}

function SidebarItem({
  item,
  collapsed,
  active,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  pathname: string;
}) {
  if (!item.subItems?.length) {
    return (
      <motion.div
        layout
        variants={itemVariants}
        initial="initial"
        animate="animate"
      >
        <Link
          href={item.href ?? '#'}
          className={cn(
            'flex items-center rounded p-2 hover:bg-gray-50',
            active && 'bg-gray-200 font-medium',
            collapsed ? 'justify-center' : ''
          )}
        >
          {item.icon}
          {!collapsed && (
            <span className="ml-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {item.label}
            </span>
          )}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="initial"
      animate="animate"
    >
      <div
        className={cn(
          'flex items-center rounded p-2 hover:bg-gray-50',
          active && 'bg-gray-200 font-medium',
          collapsed ? 'justify-center' : ''
        )}
      >
        {item.icon}
        {!collapsed && (
          <span className="ml-2 overflow-hidden text-ellipsis whitespace-nowrap">
            {item.label}
          </span>
        )}
      </div>

      <motion.ul
        variants={subItemsContainer}
        initial="hidden"
        animate={!collapsed ? 'visible' : 'hidden'}
        className="mt-1 overflow-hidden pl-8"
      >
        {item.subItems.map((sub) => {
          const subActive = pathname.startsWith(sub.href);
          return (
            <motion.li
              key={sub.href}
              variants={subItemVariant}
              className="list-none"
            >
              <Link
                href={sub.href}
                className={cn(
                  'mb-1 flex items-center rounded px-2 py-1 hover:bg-gray-100',
                  subActive && 'bg-gray-200 font-medium'
                )}
              >
                {sub.icon}
                {sub.label}
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

function SidebarSection({
  section,
  collapsed,
  pathname,
}: {
  section: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <motion.div
      layout
      variants={sectionVariants}
      initial="initial"
      animate="animate"
      className="py-2"
    >
      {section.map((item) => {
        const active = isItemActive(item, pathname);
        return (
          <div key={item.label} className="px-2 py-1">
            <SidebarItem
              item={item}
              collapsed={collapsed}
              active={active}
              pathname={pathname}
            />
          </div>
        );
      })}
    </motion.div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <motion.aside
      className="fixed top-15 bottom-0 left-0 flex h-[calc(100vh-64px)] flex-col border-r bg-white"
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      initial={collapsed ? 'collapsed' : 'expanded'}
      layout
    >
      <SidebarToggle collapsed={collapsed} setCollapsed={setCollapsed} />

      <nav className="flex-1 overflow-y-auto text-sm">
        {navSections.map((section, idx) => (
          <React.Fragment key={idx}>
            <SidebarSection
              section={section}
              collapsed={collapsed}
              pathname={pathname}
            />
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
