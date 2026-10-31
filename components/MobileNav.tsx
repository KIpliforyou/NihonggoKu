'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, FileText, Settings, MoreHorizontal } from 'lucide-react';

const primaryNav = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Bunpou', href: '/bunpou', icon: BookOpen },
  { name: 'Kotoba', href: '/kotoba', icon: FileText },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpen },
];

const moreNav = [
  { name: 'Notes', href: '/notes' },
  { name: 'Progress', href: '/progress' },
  { name: 'Settings', href: '/settings' },
];

export default function MobileNav() {
  const pathname = usePathname();

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
        <MoreHorizontal className="text-secondary-text dark:text-dark-secondary-text" size={20} />
      </div>
    </nav>
  );
}
