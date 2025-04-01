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
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />

        {/* Main content area */}
        <main className="mt-15 flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">
          {/* Centered container with max width */}
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <DashboardFooter />
    </div>
  );
}
