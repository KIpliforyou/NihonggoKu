'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { getAll } from '@/lib/db';
import { Bunpou, Kotoba, Note } from '@/types';

interface GlobalSearchProps {
  onClose: () => void;
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAll<Bunpou>('bunpou'),
      getAll<Kotoba>('kotoba'),
      getAll<Note>('notes'),
    ]).then(([b, k, n]) => {
      setBunpou(b);
      setKotoba(k);
      setNotes(n);
      setLoading(false);
    });
  }, []);

  const results = {
    bunpou: query
      ? bunpou.filter(item =>
          item.pattern.toLowerCase().includes(query.toLowerCase()) ||
          item.meaning.toLowerCase().includes(query.toLowerCase()) ||
          item.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
        )
      : [],
    kotoba: query
      ? kotoba.filter(item =>
          item.word.toLowerCase().includes(query.toLowerCase()) ||
          item.meaning.toLowerCase().includes(query.toLowerCase()) ||
          item.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
        )
      : [],
    notes: query
      ? notes.filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
        )
      : [],
  };

  const totalResults = results.bunpou.length + results.kotoba.length + results.notes.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50 p-4">
      <div className="bg-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border dark:border-dark-border">
          <Search className="text-secondary-text" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bunpou, kotoba, notes..."
            className="flex-1 bg-transparent text-primary-text dark:text-dark-primary-text placeholder:text-secondary-text dark:placeholder:text-dark-secondary-text focus:outline-none text-lg"
            autoFocus
          />
          <button onClick={onClose} className="p-2 hover:bg-soft-accent dark:hover:bg-dark-border rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-secondary-text py-8">Loading...</p>
          ) : query ? (
            totalResults === 0 ? (
              <p className="text-center text-secondary-text py-8">No results found for "{query}"</p>
            ) : (
              <div className="space-y-6">
                {results.bunpou.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-accent dark:text-dark-accent uppercase tracking-wider mb-3">
                      Bunpou ({results.bunpou.length})
                    </h3>
                    <div className="space-y-2">
                      {results.bunpou.map(item => (
                        <div key={item.id} className="p-3 bg-soft-accent dark:bg-dark-border rounded-lg">
                          <p className="font-medium text-primary-text dark:text-dark-primary-text">{item.pattern}</p>
                          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{item.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {results.kotoba.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-accent dark:text-dark-accent uppercase tracking-wider mb-3">
                      Kotoba ({results.kotoba.length})
                    </h3>
                    <div className="space-y-2">
                      {results.kotoba.map(item => (
                        <div key={item.id} className="p-3 bg-soft-accent dark:bg-dark-border rounded-lg">
                          <p className="font-medium text-primary-text dark:text-dark-primary-text">
                            {item.word}
                            {item.reading && <span className="text-secondary-text dark:text-dark-secondary-text text-sm ml-2">({item.reading})</span>}
                          </p>
                          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{item.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {results.notes.length > 0 && (
                  <section>
                    <h3 className="text-sm font-semibold text-accent dark:text-dark-accent uppercase tracking-wider mb-3">
                      Notes ({results.notes.length})
                    </h3>
                    <div className="space-y-2">
                      {results.notes.map(item => (
                        <div key={item.id} className="p-3 bg-soft-accent dark:bg-dark-border rounded-lg">
                          <p className="font-medium text-primary-text dark:text-dark-primary-text">{item.title}</p>
                          <p className="text-sm text-secondary-text dark:text-dark-secondary-text line-clamp-2">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )
          ) : (
            <p className="text-center text-secondary-text py-8">Type to search across all content</p>
          )}
        </div>
      </div>
    </div>
  );
}
