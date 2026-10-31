'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Kotoba, Bunpou } from '@/types';
import { BookOpen, Award } from 'lucide-react';

export default function ProgressPage() {
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(setBunpou);
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  const totalItems = bunpou.length + kotoba.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Progress</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          Pantau perkembangan belajarmu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {bunpou.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Bunpou</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <Award className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {totalItems}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Total</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {kotoba.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Kotoba</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <Award className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {bunpou.length + kotoba.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Total</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Progress Pembelajaran
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-secondary-text dark:text-dark-secondary-text">Kotoba Dikuasai</span>
              <span className="text-sm font-medium text-primary-text dark:text-dark-primary-text">
                {Math.round((kotoba.length / (kotoba.length || 1)) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-soft-accent dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent dark:bg-dark-accent rounded-full transition-all"
                style={{ width: `${100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-secondary-text dark:text-dark-secondary-text">Bunpou Dipelajari</span>
              <span className="text-sm font-medium text-primary-text dark:text-dark-primary-text">
                0%
              </span>
            </div>
            <div className="h-2 bg-soft-accent dark:bg-dark-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent dark:bg-dark-accent rounded-full transition-all"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Aktivitas Terbaru
        </h2>
        <p className="text-secondary-text dark:text-dark-secondary-text text-sm">
          Riwayat aktivitas akan muncul di sini setelah kamu mulai belajar.
        </p>
      </div>
    </div>
  );
}
