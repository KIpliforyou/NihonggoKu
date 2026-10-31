'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BookOpen, FileText, Settings, Inbox, BarChart3, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

export default function MobileNav({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button - only on small screens */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
          aria-label="Buka menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 z-50 h-full w-72 max-w-[80vw] bg-surface dark:bg-dark-surface border-l border-border dark:border-dark-border shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
            <h1 className="text-xl font-bold text-primary-text dark:text-dark-primary-text">
              日本語<span className="text-accent dark:text-dark-accent">Ku</span>
            </h1>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-3 border-b border-border dark:border-dark-border">
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
            >
              {isDark ? <Home size={18} /> : <BookOpen size={18} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {primaryNav.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-accent/10 dark:bg-dark-accent/20 text-accent dark:text-dark-accent'
                          : 'text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* More */}
            <div className="mt-6 pb-4">
              <p className="text-xs font-semibold text-secondary-text dark:text-dark-secondary-text uppercase tracking-wider mb-3 px-2">
                Lainnya
              </p>
              <ul className="space-y-2">
                {moreNav.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-accent/10 dark:bg-dark-accent/20 text-accent dark:text-dark-accent'
                            : 'text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Close button */}
          <div className="p-4 border-t border-border dark:border-dark-border">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 rounded-lg text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
