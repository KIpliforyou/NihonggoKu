'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Kotoba, Bunpou } from '@/types';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function FlashcardsPage() {
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(setBunpou);
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Flashcards</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          Latihan dengan flashcard interaktif
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">{bunpou.length}</p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Bunpou</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <ArrowRight className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">{kotoba.length}</p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Kotoba</p>
        </div>
      </div>

      {/* Start Session */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Mulai Sesi Latihan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/flashcards/bunpou"
            className="p-4 bg-soft-accent dark:bg-dark-border rounded-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-colors text-center"
          >
            <BookOpen className="mx-auto text-accent dark:text-dark-accent" size={32} />
            <h3 className="font-medium text-primary-text dark:text-dark-primary-text mt-2">Bunpou Flashcards</h3>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">
              {bunpou.length} kartu tersedia
            </p>
          </Link>
          <Link
            href="/flashcards/kotoba"
            className="p-4 bg-soft-accent dark:bg-dark-border rounded-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-colors text-center"
          >
            <ArrowRight className="mx-auto text-accent dark:text-dark-accent" size={32} />
            <h3 className="font-medium text-primary-text dark:text-dark-primary-text mt-2">Kotoba Flashcards</h3>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">
              {kotoba.length} kartu tersedia
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
