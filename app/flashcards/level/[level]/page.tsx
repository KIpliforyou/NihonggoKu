'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Kotoba } from '@/types';

const LEVEL_MAP: Record<string, string> = {
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
};

export default function LevelFlashcardsPage({ params }: { params: { level: string } }) {
  const [items, setItems] = useState<Kotoba[]>([]);
  const [loading, setLoading] = useState(true);
  const level = LEVEL_MAP[params.level] || params.level.toUpperCase();

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const res = await fetch(`/api/content?type=kotoba&file=data.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const allData: Kotoba[] = await res.json();
        const filtered = allData.filter((i: Kotoba) => i.tags && i.tags.includes(level));
        if (!cancelled) {
          setItems(filtered);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, [level]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <p className="text-lg text-secondary-text">Memuat data...</p>
      </div>
    );
  }

  const total = items.length;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
          {level}: Tidak ditemukan
        </h1>
        <p className="text-secondary-text dark:text-dark-secondary-text">
          Level {level} belum tersedia atau kosong.
        </p>
        <Link
          href="/flashcards"
          className="mt-4 text-accent dark:text-dark-accent hover:underline"
        >
          &larr; Kembali ke Flashcards
        </Link>
      </div>
    );
  }

  const getRandomItem = (): Kotoba => {
    if (items.length === 0) return items[0];
    const idx = Math.floor(Math.random() * items.length);
    return items[idx];
  };

  const [currentItem, setCurrentItem] = useState<Kotoba>(getRandomItem());
  const [cardFlipped, setCardFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Auto-advance: after 3 seconds, automatically go to next card
  useEffect(() => {
    if (sessionFinished) return;
    const timer = setTimeout(() => {
      setCardFlipped(false);
      nextCard();
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentItem.id, sessionFinished]);

  const handleKnown = () => {
    setKnownCards(prev => [...prev, currentItem.id]);
    nextCard();
  };

  const handleUnknown = () => {
    nextCard();
  };

  const nextCard = () => {
    setCardFlipped(false);
    const idx = items.findIndex(i => i.id === currentItem.id);
    const nextIdx = (idx + 1) % total;
    setCurrentItem(items[nextIdx]);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/flashcards"
          className="flex items-center gap-2 text-secondary-text dark:text-dark-secondary-text hover:text-accent dark:hover:text-dark-accent transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">
          {level}
        </h1>
        <p className="text-secondary-text dark:text-dark-secondary-text">
          {total} kartu tersedia
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
              <div className="h-2 bg-soft-accent dark:bg-dark-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent dark:bg-dark-accent transition-all duration-300"
                  style={{ width: `${total > 0 ? 100 : 0}%` }}
                />
              </div>
              <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-2">
                {total > 0 ? Math.round((1 / total) * 100) : 0} / {total}
              </p>
            </div>

      {/* Card */}
      <div
        className="relative bg-surface dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 shadow-sm"
        onClick={() => setCardFlipped(f => !f)}
      >
        <div className="text-center w-full">
          {!cardFlipped ? (
            <>
              <p className="text-5xl font-bold text-primary-text dark:text-dark-primary-text mb-4 font-jp">
                {currentItem.kanji || currentItem.word}
              </p>
              <p className="text-sm text-muted-foreground">
                Klik kartu untuk melihat reading &amp; arti
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text font-jp">
                  {currentItem.kanji || currentItem.word}
                </p>
                {currentItem.reading && (
                  <p className="text-3xl font-semibold text-accent dark:text-dark-accent mt-2 font-jp">
                    {currentItem.reading}
                  </p>
                )}
              </div>

              <div className="my-4 pt-4 border-t border-border dark:border-dark-border">
                <p className="text-xl font-medium text-primary-text dark:text-dark-primary-text">
                  {currentItem.meaning || '—'}
                </p>
                {currentItem.partOfSpeech && (
                  <p className="text-xs text-secondary-text dark:text-dark-secondary-text italic mt-1">
                    {currentItem.partOfSpeech}
                  </p>
                )}
              </div>

              {currentItem.examples && currentItem.examples.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50 dark:border-dark-border/50 w-full text-left bg-soft-accent/30 dark:bg-dark-border/30 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-secondary-text dark:text-dark-secondary-text uppercase mb-1">
                    Contoh:
                  </p>
                  {currentItem.examples.map((ex, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-jp text-primary-text dark:text-dark-primary-text">{ex.japanese}</p>
                      {ex.translation && (
                        <p className="text-secondary-text dark:text-dark-secondary-text text-xs mt-0.5">
                          {ex.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Klik untuk membalik kartu
              </p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleUnknown}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-red-500 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6L6 18M6 6l12 12" />
          </svg>
          Belum Tahu
        </button>
        <button
          onClick={handleKnown}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text rounded-xl hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Sudah Tahu
        </button>
      </div>

      {/* Restart */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setCurrentItem(getRandomItem());
            setCardFlipped(false);
            setKnownCards([]);
            setSessionFinished(false);
          }}
          className="px-4 py-2 bg-soft-accent dark:bg-dark-border text-primary-text dark:text-dark-primary-text rounded-lg hover:bg-accent/20 dark:hover:bg-dark-border/50 transition-colors"
        >
          Ulangi Sesi
        </button>
      </div>
    </div>
  );
}
