'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Utensils, Dumbbell, TrendingUp, Settings, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: TrendingUp },
    { name: 'Nutrition', href: '/nutrition', icon: Utensils },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Shop', href: '/products', icon: ShoppingBag },
    { name: 'Community', href: '/community', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background-dark border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-2xl font-black text-white">
            ISTANI
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background-dark border-r border-white/10 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link href="/" className="text-2xl font-black text-white" onClick={() => setIsOpen(false)}>
              ISTANI
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary text-background-dark font-medium'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-dark border-t border-white/10 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {[
            { name: 'Home', href: '/', icon: Home },
            { name: 'Nutrition', href: '/nutrition', icon: Utensils },
            { name: 'Workouts', href: '/workouts', icon: Dumbbell },
            { name: 'Progress', href: '/progress', icon: TrendingUp },
            { name: 'More', onClick: () => setIsOpen(true), icon: Menu },
          ].map((item, index) => {
            const Icon = item.icon;
            const active = item.href ? isActive(item.href) : false;

            if (item.onClick) {
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'text-primary font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for fixed bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  );
}

export default MobileNav;
