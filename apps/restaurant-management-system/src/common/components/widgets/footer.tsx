'use client';

import React from 'react';

export function DashboardFooter() {
  return (
    <footer className="bg-background text-muted-foreground border-t p-4 text-center text-sm">
      <p>
        &copy; {new Date().getFullYear()} Origin Food House POS. All rights
        reserved.
      </p>
    </footer>
  );
}
