'use client';

import { useState, useEffect } from 'react';
import { getAll, add } from '@/lib/db';
import type { Kotoba } from '@/types';

export default function KotobaImportPage() {
  const [status, setStatus] = useState<string>('');
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);

  useEffect(() => {
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  const handleImport = async (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        setStatus('Error: Expected JSON array');
        return;
      }

      let imported = 0;
      let skipped = 0;

      for (const item of data) {
        const kotoba: Kotoba = {
          id: item.id || `imported-${Date.now()}-${imported}`,
          word: item.word || '',
          kanji: item.kanji || '',
          reading: item.reading || '',
          meaning: item.meaning || '',
          partOfSpeech: item.partOfSpeech || undefined,
          exampleJp: item.exampleJp || undefined,
          tags: item.tags || [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };

        // Check if already exists
        const existing = await getAll<Kotoba>('kotoba');
        const exists = existing.some(e => e.word === kotoba.word && e.meaning === kotoba.meaning);

        if (!exists) {
          await add<Kotoba>('kotoba', kotoba);
          imported++;
        } else {
          skipped++;
        }
      }

      setStatus(`Imported ${imported} items, skipped ${skipped} duplicates`);
      getAll<Kotoba>('kotoba').then(setKotoba);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Impor Kotoba</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          Impor kosakata dari file JSON
        </p>
      </div>

      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Paste JSON Data
        </h2>
        <textarea
          id="json-input"
          className="w-full h-48 p-3 bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent font-mono text-sm"
          placeholder='[{"word":"学校","kanji":"学","reading":"がく","meaning":"sekolah"}]'
        />
        <button
          onClick={() => {
            const input = document.getElementById('json-input') as HTMLTextAreaElement;
            if (input?.value) {
              handleImport(input.value);
            }
          }}
          className="mt-3 px-4 py-2 bg-accent dark:bg-dark-accent text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Impor Sekarang
        </button>
        {status && (
          <p className="mt-3 text-sm text-secondary-text dark:text-dark-secondary-text">{status}</p>
        )}
      </div>

      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Total Kotoba: {kotoba.length}
        </h2>
        <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
          Kosakata tersimpan di browser Anda secara lokal.
        </p>
      </div>
    </div>
  );
}
