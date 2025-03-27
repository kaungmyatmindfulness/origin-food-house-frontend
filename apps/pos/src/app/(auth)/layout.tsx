import Image from 'next/image';
import React from 'react';

export const metadata = {
  title: 'Auth',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-4">
      <div className="bg-opacity-90 flex w-full max-w-md flex-col rounded-lg bg-white p-8 shadow-xl">
        {/* HEADER */}
        <header className="mb-6 text-center">
          <div className="flex flex-col items-center">
            {/* Update with your own logo path */}
            <Image src="/logo.svg" alt="App Logo" width={128} height={64} />
          </div>
          {/* You can optionally pass a dynamic message from each page, 
              but here we keep a static or generic heading. */}
          <p className="text-gray-600">Please sign in or register</p>
        </header>

        {/* The actual page content */}
        {children}

        {/* FOOTER */}
        <footer className="mt-6 border-t border-gray-300 pt-4 text-center text-gray-600">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Origin Food House. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
