'use client';

import React from 'react';
import { DashboardHeader } from '@/common/components/widgets/dashboard-header';
import { DashboardSidebar } from '@/common/components/widgets/sidebar';
import { DashboardFooter } from '@/common/components/widgets/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <DashboardHeader />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}
