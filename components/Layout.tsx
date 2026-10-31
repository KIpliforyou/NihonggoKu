'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import ContentSync from '@/components/ContentSync';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('nihonggoku-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('nihonggoku-theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <ContentSync />
      <div className="flex flex-col min-h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header isDark={isDark} onToggleTheme={toggleTheme} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}
