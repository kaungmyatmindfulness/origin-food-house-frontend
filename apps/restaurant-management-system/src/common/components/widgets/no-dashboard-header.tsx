'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export function NoDashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      <Link href="/">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={64}
          height={32}
          priority
          style={{ height: 'auto' }}
        />
      </Link>
      <div />
    </header>
  );
}
