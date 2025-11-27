'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DashboardHeader } from '@/common/components/widgets/dashboard-header';
import { DashboardSidebar } from '@/common/components/widgets/sidebar';
import { DashboardFooter } from '@/common/components/widgets/footer';

/**
 * We match the sidebar's widths from `DashboardSidebar`:
 *  - collapsed => 4rem
 *  - expanded => 16rem
 */
const mainVariants: Variants = {
  collapsed: {
    marginLeft: '4rem',
    transition: { duration: 0.3 },
  },
  expanded: {
    marginLeft: '16rem',
    transition: { duration: 0.3 },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The layout controls collapsed/expanded
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <div className="relative flex flex-1">
        {/* The sidebar is on the left, toggling between 4rem/16rem */}
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* The main content uses margin-left to animate alongside the sidebar */}
        <motion.main
          variants={mainVariants}
          animate={collapsed ? 'collapsed' : 'expanded'}
          initial={collapsed ? 'collapsed' : 'expanded'}
          className="relative flex-1 overflow-auto bg-gray-50 p-4 sm:p-6"
        >
          {/* Center content */}
          <div className="mx-auto h-full w-full max-w-7xl">{children}</div>
        </motion.main>
      </div>

      <DashboardFooter />
    </div>
  );
}
