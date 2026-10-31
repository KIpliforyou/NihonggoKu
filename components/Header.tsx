'use client';

import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import QuickAddModal from '@/components/QuickAddModal';
import GlobalSearch from '@/components/GlobalSearch';

export default function Header({ isDark, onToggleTheme }: { isDark: boolean; onToggleTheme: () => void }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <header className="bg-surface dark:bg-dark-surface border-b border-border dark:border-dark-border px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2 bg-soft-accent dark:bg-dark-border rounded-lg text-secondary-text dark:text-dark-secondary-text text-sm hover:text-primary-text dark:hover:text-dark-primary-text transition-colors"
          >
            <Search size={16} />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline px-2 py-0.5 bg-surface dark:bg-dark-surface rounded text-xs">⌘K</kbd>
          </button>

          {/* Title */}
          <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text hidden md:block">
            NihonggoKu
          </h2>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent dark:bg-dark-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              <span className="hidden md:inline">Quick Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} />
      )}
      {showSearch && (
        <GlobalSearch onClose={() => setShowSearch(false)} />
      )}
    </>
  );
}
