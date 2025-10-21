'use client';

import React from 'react';

export function DashboardFooter() {
  return (
    <footer className="border-t bg-white p-4 text-center text-sm text-gray-500">
      <p>
        &copy; {new Date().getFullYear()} Origin Food House POS. All rights
        reserved.
      </p>
    </footer>
  );
}
