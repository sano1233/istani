'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userName: string;
  userAvatar?: string;
}

export function Sidebar({ userName, userAvatar }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: 'https://istani.store', icon: 'home', label: 'Home', external: true },
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/workouts', icon: 'fitness_center', label: 'Workouts' },
    { href: '/progress', icon: 'trending_up', label: 'Progress' },
    { href: '/nutrition', icon: 'restaurant', label: 'Nutrition' },
    { href: '/analytics', icon: 'bar_chart', label: 'Analytics' },
    { href: '/social', icon: 'groups', label: 'Community' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="flex-shrink-0 w-64 p-4 border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* User Profile */}
        <div className="flex items-center gap-3 p-2 mb-6">
          <div className="flex items-center justify-center rounded-full size-10 bg-primary/20 text-primary">
            <span className="material-symbols-outlined">bar_chart_4_bars</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-medium text-white">{userName}</h1>
            <p className="text-sm font-normal text-white/60">ISTANI FITNESS</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const LinkComponent = link.external ? 'a' : Link;
            return (
              <LinkComponent
                key={link.href}
                href={link.href}
                {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive ? 'bg-primary/20 text-primary' : 'text-white hover:bg-white/10',
                )}
              >
                <span className={cn('material-symbols-outlined', isActive && 'fill')}>
                  {link.icon}
                </span>
                <p className="text-sm font-medium">{link.label}</p>
              </LinkComponent>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="mt-auto">
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2 text-white rounded-lg hover:bg-white/10"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Log Out</p>
          </Link>
        </div>
      </div>
    </aside>
  );
}
