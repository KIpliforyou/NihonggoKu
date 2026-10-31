'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, BarChart3, Settings, Sun, Moon, Upload } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home, category: 'overview' },
  { name: 'Bunpou', href: '/bunpou', icon: BookOpen, category: 'learning' },
  { name: 'Kotoba', href: '/kotoba', icon: FileText, category: 'learning' },
  { name: 'Flashcards', href: '/flashcards', icon: BookOpen, category: 'practice' },
  { name: 'Notes', href: '/notes', icon: FileText, category: 'personal' },
  { name: 'Progress', href: '/progress', icon: BarChart3, category: 'personal' },
  { name: 'Impor Data', href: '/import', icon: Upload, category: 'settings' },
  { name: 'Settings', href: '/settings', icon: Settings, category: 'settings' },
];

export default function Sidebar({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const pathname = usePathname();

  const categories = {
    overview: navItems.filter(i => i.category === 'overview'),
    learning: navItems.filter(i => i.category === 'learning'),
    practice: navItems.filter(i => i.category === 'practice'),
    personal: navItems.filter(i => i.category === 'personal'),
    settings: navItems.filter(i => i.category === 'settings'),
  };

  return (
    <aside className="w-64 bg-surface dark:bg-dark-surface border-r border-border dark:border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border dark:border-dark-border">
        <h1 className="text-xl font-bold text-primary-text dark:text-dark-primary-text">
          日本語<span className="text-accent dark:text-dark-accent">Ku</span>
        </h1>
        <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-1">
          Personal Japanese Learning
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {Object.entries(categories).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <p className="text-xs font-semibold text-secondary-text dark:text-dark-secondary-text uppercase tracking-wider mb-2 px-2">
              {cat}
            </p>
            <ul className="space-y-1">
              {items.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-accent/10 dark:bg-dark-accent/20 text-accent dark:text-dark-accent'
                          : 'text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border dark:border-dark-border">
        <Link
          href="/import"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border w-full transition-colors mb-2"
        >
          <Upload size={18} />
          Impor Data
        </Link>
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border w-full transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  );
}
