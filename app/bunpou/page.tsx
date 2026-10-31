'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Bunpou } from '@/types';
import Link from 'next/link';
import { BookOpen, Plus, Trash2, Pencil, ChevronRight } from 'lucide-react';
import BunpouModal from '@/components/BunpouModal';

export default function BunpouPage() {
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Bunpou | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(setBunpou);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Bunpou</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          {bunpou.length} materi tata bahasa
        </p>
      </div>

      {bunpou.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="mx-auto text-secondary-text" size={48} />
          <p className="mt-4 text-secondary-text dark:text-dark-secondary-text">
            Belum ada materi bunpou. Tambahkan manual atau impor dari file JSON.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bunpou.slice(0, 10).map((item: Bunpou) => (
            <div
              key={item.id}
              className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border"
            >
              <h3 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text font-jp">
                {item.pattern}
              </h3>
              <p className="text-secondary-text dark:text-dark-secondary-text mt-1">{item.meaning}</p>
              {item.function && (
                <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">{item.function}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {bunpou.length > 10 && (
        <div className="text-center">
          <Link
            href="/flashcards"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text rounded-lg border border-border dark:border-dark-border hover:border-accent dark:hover:border-dark-accent transition-colors"
          >
            Lihat semua <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
