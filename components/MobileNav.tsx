'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, FileText, Settings, MoreHorizontal, Inbox, BarChart3 } from 'lucide-react';

const primaryNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Bunpou', href: '/bunpou', icon: BookOpen },
  { name: 'Kotoba', href: '/kotoba', icon: FileText },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpen },
];

const moreNav = [
  { name: 'Notes', href: '/notes', icon: Inbox },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-dark-surface border-t border-border dark:border-dark-border px-4 py-2 flex justify-around items-center z-50">
      {primaryNav.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'text-accent dark:text-dark-accent'
                : 'text-secondary-text dark:text-dark-secondary-text'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs">{item.name}</span>
          </Link>
        );
      })}

      {/* More dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className="p-2 rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
          aria-label="Menu tambahan"
        >
          <MoreHorizontal className="text-secondary-text dark:text-dark-secondary-text" size={20} />
        </button>

        {isMoreOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMoreOpen(false)}
            />
            {/* Dropdown */}
            <div className="absolute bottom-full left-4 right-4 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-t-xl shadow-lg z-50 overflow-hidden">
              {moreNav.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive
                        ? 'bg-accent/10 dark:bg-dark-accent/20 text-accent dark:text-dark-accent'
                        : 'text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
