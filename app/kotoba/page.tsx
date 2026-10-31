'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAll } from '@/lib/db';
import type { Kotoba } from '@/types';
import Link from 'next/link';
import { FileText, Search, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function KotobaPage() {
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFurigana, setShowFurigana] = useState(true);

  useEffect(() => {
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return kotoba;
    return kotoba.filter(item => {
      const w = item.word.toLowerCase();
      const k = item.kanji ? item.kanji.toLowerCase() : '';
      const r = item.reading ? item.reading.toLowerCase() : '';
      const m = item.meaning ? item.meaning.toLowerCase() : '';
      const t = item.tags ? item.tags.join(' ').toLowerCase() : '';
      return w.includes(q) || k.includes(q) || r.includes(q) || m.includes(q) || t.includes(q);
    });
  }, [kotoba, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const speak = (text: string) => {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Kotoba</h1>
          <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
            {filtered.length} dari {kotoba.length} kosakata
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFurigana(prev => !prev)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
          >
            Furigana: {showFurigana ? 'ON' : 'OFF'}
          </button>
          <Link
            href="/flashcards/kotoba"
            className="px-4 py-2 bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text rounded-lg text-sm hover:opacity-90 font-medium transition-opacity"
          >
            Latihan Flashcard
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Cari kanji, bacaan, arti, atau tag (contoh: h2, h3, pendidikan)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
        />
      </div>

      {/* Grid Kosakata */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <FileText className="mx-auto text-secondary-text" size={48} />
          <p className="mt-4 text-secondary-text dark:text-dark-secondary-text">
            {search ? 'Tidak ada kosakata yang cocok dengan pencarian.' : 'Belum ada kosakata tersimpan.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((item: Kotoba) => (
            <div
              key={item.id}
              className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border hover:border-accent/50 dark:hover:border-dark-accent/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text font-jp">
                    {item.kanji || item.word}
                  </h3>
                  <button
                    onClick={() => speak(item.word || item.reading)}
                    title="Dengarkan pengucapan"
                    className="p-1 text-secondary-text hover:text-accent dark:hover:text-dark-accent transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {showFurigana && item.reading && (
                  <p className="text-sm font-medium text-accent dark:text-dark-accent mt-0.5 font-jp">
                    {item.reading}
                  </p>
                )}

                <p className="mt-2 text-sm text-primary-text dark:text-dark-primary-text leading-snug">
                  {item.meaning}
                </p>

                {item.partOfSpeech && (
                  <p className="text-xs text-secondary-text dark:text-dark-secondary-text italic mt-1">
                    {item.partOfSpeech}
                  </p>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-border/50 dark:border-dark-border/50">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 text-[10px] uppercase font-semibold rounded bg-soft-accent dark:bg-dark-border text-secondary-text dark:text-dark-secondary-text"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border dark:border-dark-border">
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
            Halaman {currentPage} dari {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium px-2 text-primary-text dark:text-dark-primary-text">
              {currentPage}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
              title="Halaman Berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
