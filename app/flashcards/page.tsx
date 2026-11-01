'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

const levels = [
  { id: 'h2', label: 'H2', count: 39 },
  { id: 'h3', label: 'H3', count: 36 },
  { id: 'h4', label: 'H4', count: 32 },
  { id: 'h5', label: 'H5', count: 47 },
];

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Flashcards</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          Latihan dengan kartu interaktif &mdash; pilih level untuk mulai
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">4</p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Level</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">{levels.reduce((s, l) => s + l.count, 0)}</p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Kotoba</p>
        </div>
      </div>

      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Pilih Level Latihan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {levels.map((l) => (
            <Link
              key={l.id}
              href={`/flashcards/level/${l.id}`}
              className="p-4 bg-soft-accent dark:bg-dark-border rounded-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-colors text-center group"
            >
              <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mb-1">{l.label}</p>
              <p className="text-sm text-secondary-text dark:text-dark-secondary-text group-hover:text-accent dark:group-hover:text-dark-accent transition-colors">{l.count} kartu</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-soft-accent dark:bg-dark-border rounded-xl p-4 flex items-start gap-3">
        <BookOpen size={20} className="text-accent dark:text-dark-accent mt-1" />
        <div>
          <p className="text-sm font-medium text-primary-text dark:text-dark-primary-text">Cara pakai:</p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">Pilih level H2&ndash;H5, lalu kerjakan flashcard satu per satu. Klik kartu untuk melihat reading &amp; arti.</p>
        </div>
      </div>
    </div>
  );
}
