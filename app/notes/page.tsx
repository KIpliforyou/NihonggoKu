'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Note } from '@/types';
import { FileText } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    getAll<Note>('notes').then(setNotes);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Notes</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          {notes.length} catatan tersimpan
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border">
          <FileText className="mx-auto text-secondary-text" size={48} />
          <p className="mt-4 text-secondary-text dark:text-dark-secondary-text">
            Belum ada catatan. Tambahkan catatan belajar pertamamu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((item: Note) => (
            <div
              key={item.id}
              className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-primary-text dark:text-dark-primary-text">{item.title}</h3>
                  {item.category && (
                    <span className="text-xs text-accent dark:text-dark-accent">{item.category}</span>
                  )}
                </div>
                <span className="text-xs text-secondary-text dark:text-dark-secondary-text">
                  {new Date(item.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-2 line-clamp-2">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
