'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
  Users,
  CreditCard,
  FileText,
  Building2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/stores', label: 'Stores', icon: Store },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-card flex w-64 flex-col border-r">
      <div className="border-b p-6">
        <div className="flex items-center gap-2">
          <Building2 className="text-primary h-6 w-6" />
          <h2 className="text-xl font-bold">Admin Platform</h2>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">Origin Food House</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
