'use client';

import React from 'react';
import { NoDashboardHeader } from '@/common/components/widgets/no-dashboard-header';
import { DashboardFooter } from '@/common/components/widgets/footer';

export default function NoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NoDashboardHeader />

      <main className="flex-1 bg-gray-50 p-4">{children}</main>

      <DashboardFooter />
    </div>
  );
}
