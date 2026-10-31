'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAll } from '@/lib/db';
import type { Bunpou } from '@/types';
import Link from 'next/link';
import { BookOpen, Search, X, Volume2, ChevronRight, Bookmark } from 'lucide-react';

export default function BunpouPage() {
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selected, setSelected] = useState<Bunpou | null>(null);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(setBunpou);
  }, []);

  // Ambil semua kategori unik dari tags
  const categories = useMemo(() => {
    const set = new Set<string>();
    bunpou.forEach(b => {
      if (b.tags) {
        b.tags.forEach(t => {
          if (t !== 'JLPT N2' && t !== 'jlpt-n2') set.add(t);
        });
      }
    });
    return Array.from(set).sort();
  }, [bunpou]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bunpou.filter(item => {
      const matchCat =
        selectedCategory === 'all' ||
        (item.tags && item.tags.includes(selectedCategory));
      
      if (!matchCat) return false;
      if (!q) return true;

      const p = item.pattern.toLowerCase();
      const m = item.meaning.toLowerCase();
      const f = (item.function || '').toLowerCase();
      const r = (item.formation || '').toLowerCase();
      const t = (item.tags || []).join(' ').toLowerCase();

      return p.includes(q) || m.includes(q) || f.includes(q) || r.includes(q) || t.includes(q);
    });
  }, [bunpou, search, selectedCategory]);

  const speak = (text: string) => {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Bunpou (JLPT N2)</h1>
          <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
            {filtered.length} dari {bunpou.length} pola tata bahasa aktif
          </p>
        </div>

        <Link
          href="/flashcards/bunpou"
          className="px-4 py-2 bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text rounded-lg text-sm hover:opacity-90 font-medium transition-opacity inline-flex items-center gap-2 self-start md:self-auto"
        >
          <BookOpen size={16} /> Latihan Flashcard
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pola, rumus, arti, atau penjelasan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
          />
        </div>

        {/* Filter Tags */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text'
                  : 'bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-secondary-text hover:text-primary-text'
              }`}
            >
              Semua ({bunpou.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-accent dark:bg-dark-accent text-white dark:text-dark-primary-text'
                    : 'bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-secondary-text hover:text-primary-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Card Bunpou (Gaya LearningN2) */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="mx-auto text-secondary-text" size={48} />
          <p className="mt-4 text-secondary-text dark:text-dark-secondary-text">
            Tidak ada pola yang cocok dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="p-5 bg-surface dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border hover:border-accent/60 dark:hover:border-dark-accent/60 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Header Tag / Level */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider bg-soft-accent dark:bg-dark-border text-accent dark:text-dark-accent uppercase">
                    {item.tags?.find(t => t !== 'JLPT N2') || 'N2'}
                  </span>
                  <span className="text-xs text-secondary-text dark:text-dark-secondary-text">
                    JLPT N2
                  </span>
                </div>

                {/* Pattern Title */}
                <h3 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text font-jp mt-1">
                  {item.pattern}
                </h3>

                {/* Formula (Rumus Pola) */}
                {item.formation && (
                  <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-1.5 font-mono bg-background dark:bg-dark-background px-2.5 py-1 rounded border border-border/50 dark:border-dark-border/50">
                    {item.formation}
                  </p>
                )}

                {/* Meaning Block */}
                <div className="mt-3 p-3 rounded-xl bg-soft-accent/40 dark:bg-dark-border/30 border border-border/40 dark:border-dark-border/40">
                  <span className="text-[10px] font-bold text-accent dark:text-dark-accent uppercase tracking-wider block mb-0.5">
                    Arti Pola
                  </span>
                  <p className="text-sm font-semibold text-primary-text dark:text-dark-primary-text">
                    {item.meaning}
                  </p>
                </div>

                {/* Explanation */}
                {item.function && (
                  <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-3 line-clamp-2 leading-relaxed">
                    {item.function}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-border/60 dark:border-dark-border/60 flex items-center justify-between">
                <button
                  onClick={() => setSelected(item)}
                  className="w-full py-2 px-3 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text hover:bg-soft-accent dark:hover:bg-dark-border hover:border-accent dark:hover:border-dark-accent text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5"
                >
                  Lihat Detail & Contoh <ChevronRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Detail Bunpou Lengkap (Gaya LearningN2) */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface dark:bg-dark-surface rounded-2xl border border-border dark:border-dark-border shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border dark:border-dark-border pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-soft-accent dark:bg-dark-border text-accent dark:text-dark-accent uppercase">
                  JLPT N2 Bunpou
                </span>
                <h2 className="text-3xl font-bold text-primary-text dark:text-dark-primary-text font-jp mt-1">
                  {selected.pattern}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border text-secondary-text transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Arti Pola */}
            <div className="p-4 rounded-xl bg-soft-accent/50 dark:bg-dark-border/40 border border-border dark:border-dark-border">
              <span className="text-xs font-bold text-accent dark:text-dark-accent uppercase tracking-wider block mb-1">
                Arti Pola
              </span>
              <p className="text-lg font-bold text-primary-text dark:text-dark-primary-text">
                {selected.meaning}
              </p>
            </div>

            {/* Rumus */}
            {selected.formation && (
              <div>
                <h4 className="text-xs font-bold text-secondary-text dark:text-dark-secondary-text uppercase tracking-wider mb-1">
                  Rumus / Bentuk Kalimat
                </h4>
                <div className="p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border font-mono text-sm text-primary-text dark:text-dark-primary-text">
                  {selected.formation}
                </div>
              </div>
            )}

            {/* Penjelasan */}
            {selected.function && (
              <div>
                <h4 className="text-xs font-bold text-secondary-text dark:text-dark-secondary-text uppercase tracking-wider mb-1">
                  Penjelasan Pola
                </h4>
                <p className="text-sm text-primary-text dark:text-dark-primary-text leading-relaxed">
                  {selected.function}
                </p>
              </div>
            )}

            {/* Contoh Kalimat */}
            {selected.examples && selected.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-secondary-text dark:text-dark-secondary-text uppercase tracking-wider mb-2">
                  Contoh Kalimat
                </h4>
                <div className="space-y-2.5">
                  {selected.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-base font-medium font-jp text-primary-text dark:text-dark-primary-text">
                          {ex.japanese}
                        </p>
                        {ex.translation && (
                          <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-1">
                            {ex.translation}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => speak(ex.japanese)}
                        title="Dengarkan Audio Jepang"
                        className="p-2 text-secondary-text hover:text-accent dark:hover:text-dark-accent rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border transition-colors shrink-0"
                      >
                        <Volume2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catatan jika ada */}
            {selected.note && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-800 dark:text-yellow-200">
                <b>Catatan:</b> {selected.note}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 rounded-lg bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-primary-text dark:text-dark-primary-text text-sm font-medium hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
