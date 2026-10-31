'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAll } from '@/lib/db';
import type { Bunpou } from '@/types';
import Link from 'next/link';
import { ArrowLeft, RotateCw, Check, X } from 'lucide-react';

export default function BunpouFlashcardsPage() {
  const [items, setItems] = useState<Bunpou[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(data => {
      setItems(data);
    });
  }, []);

  const currentItem = items[currentIndex];
  const progress = items.length > 0 ? Math.round((currentIndex / items.length) * 100) : 0;
  const knownCount = known.length;

  const handleKnown = useCallback(() => {
    if (!currentItem) return;
    setKnown(prev => [...prev, currentItem.id]);
    nextCard();
  }, [currentItem]);

  const handleUnknown = useCallback(() => {
    nextCard();
  }, []);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 >= items.length) {
        setSessionDone(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 150);
  }, [currentIndex, items.length]);

  const restartSession = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnown([]);
    setSessionDone(false);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-secondary-text dark:text-dark-secondary-text">Belum ada materi bunpou.</p>
        <Link href="/bunpou" className="mt-4 text-accent dark:text-dark-accent hover:underline">
          ← Kembali ke Bunpou
        </Link>
      </div>
    );
  }

  if (sessionDone) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mb-4">
          Sesi Selesai!
        </h1>
        <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6 mb-6">
          <p className="text-4xl font-bold text-accent dark:text-dark-accent">{knownCount}</p>
          <p className="text-secondary-text dark:text-dark-secondary-text mt-1">dari {items.length} kartu diketahui</p>
          <div className="mt-4 h-2 bg-soft-accent dark:bg-dark-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent dark:bg-dark-accent transition-all"
              style={{ width: `${items.length > 0 ? (knownCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={restartSession}
            className="flex items-center gap-2 px-4 py-2 bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text rounded-lg hover:opacity-90 transition-opacity"
          >
            <RotateCw size={16} /> Ulangi Sesi
          </button>
          <Link
            href="/flashcards"
            className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/flashcards" className="flex items-center gap-2 text-secondary-text dark:text-dark-secondary-text hover:text-accent dark:hover:text-dark-accent transition-colors">
          <ArrowLeft size={16} /> Kembali
        </Link>
        <span className="text-sm text-secondary-text dark:text-dark-secondary-text">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 bg-soft-accent dark:bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent dark:bg-dark-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative bg-surface dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border p-8 min-h-[280px] flex flex-col items-center justify-center cursor-pointer transition-transform duration-300"
        onClick={() => setFlipped(f => !f)}
      >
        <div className="text-center">
          {!flipped ? (
            <>
              <p className="text-3xl font-bold text-primary-text dark:text-dark-primary-text mb-3">
                {currentItem.pattern}
              </p>
              {currentItem.formation && (
                <p className="text-sm text-secondary-text dark:text-dark-secondary-text italic">
                  {currentItem.formation}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-4">Klik untuk melihat arti</p>
            </>
          ) : (
            <>
              <p className="text-xl text-primary-text dark:text-dark-primary-text mb-3">
                {currentItem.meaning || '—'}
              </p>
              {currentItem.examples && currentItem.examples.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border dark:border-dark-border w-full">
                  {currentItem.examples.map((ex, i) => (
                    <p key={i} className="text-sm text-secondary-text dark:text-dark-secondary-text italic">
                      {ex.japanese}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">Klik untuk kembali</p>
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
          <X size={18} /> Belum Tahu
        </button>
        <button
          onClick={handleKnown}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text rounded-xl hover:opacity-90 transition-opacity"
        >
          <Check size={18} /> Sudah Tahu
        </button>
      </div>
    </div>
  );
}
