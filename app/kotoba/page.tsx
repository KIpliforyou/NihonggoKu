'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Kotoba } from '@/types';
import Link from 'next/link';
import { FileText, Plus, Trash2, Pencil, ChevronRight } from 'lucide-react';
import KotobaModal from '@/components/KotobaModal';

export default function KotobaPage() {
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Kotoba | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);

  useEffect(() => {
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Kotoba</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          {kotoba.length} kosakata tersimpan
        </p>
      </div>

      {kotoba.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <FileText className="mx-auto text-secondary-text" size={48} />
          <p className="mt-4 text-secondary-text dark:text-dark-secondary-text">
            Belum ada kosakata. Impor dari file JSON atau tambahkan manual.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/api/import/kotoba"
              className="px-4 py-2 bg-accent dark:bg-dark-accent text-white rounded-lg text-sm hover:opacity-90"
            >
              Impor JSON
            </Link>
            <Link
              href="/flashcards"
              className="px-4 py-2 bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text rounded-lg text-sm border border-border dark:border-dark-border"
            >
              Buat Flashcard
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kotoba.slice(0, 12).map((item: Kotoba) => (
            <div
              key={item.id}
              className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border"
            >
              <h3 className="text-xl font-semibold text-primary-text dark:text-dark-primary-text font-jp">
                {item.word}
              </h3>
              {item.reading && (
                <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">{item.reading}</p>
              )}
              <p className="mt-2 text-primary-text dark:text-dark-primary-text">{item.meaning}</p>
              {item.partOfSpeech && (
                <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-1 italic">{item.partOfSpeech}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {kotoba.length > 12 && (
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
