'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { add, update } from '@/lib/db';
import { Kotoba } from '@/types';
import { generateId } from '@/lib/utils';

interface KotobaModalProps {
  item: Kotoba | null;
  onClose: () => void;
  onSave: () => void;
}

export default function KotobaModal({ item, onClose, onSave }: KotobaModalProps) {
  const initialForm = {
    word: item?.word || '',
    kanji: item?.kanji || '',
    reading: item?.reading || '',
    meaning: item?.meaning || '',
    partOfSpeech: item?.partOfSpeech || '',
    exampleJp: item?.exampleJp || '',
    exampleId: item?.exampleId || '',
    note: item?.note || '',
    tags: item?.tags || [],
  };
  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (item) {
      await update('kotoba', { ...form, id: item.id, updatedAt: Date.now() });
    } else {
      const newItem: Kotoba = {
        ...form,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await add('kotoba', newItem);
    }
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">
            {item ? 'Edit Kotoba' : 'Tambah Kotoba'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-soft-accent dark:hover:bg-dark-border rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Kata (Jepang) *
            </label>
            <input
              value={form.word}
              onChange={e => setForm({ ...form, word: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent font-jp text-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                Kanji
              </label>
              <input
                value={form.kanji}
                onChange={e => setForm({ ...form, kanji: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent font-jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                Reading (Hiragana)
              </label>
              <input
                value={form.reading}
                onChange={e => setForm({ ...form, reading: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent font-jp"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Arti (Indonesia) *
            </label>
            <input
              value={form.meaning}
              onChange={e => setForm({ ...form, meaning: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Part of Speech
            </label>
            <input
              value={form.partOfSpeech}
              onChange={e => setForm({ ...form, partOfSpeech: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
              placeholder="kata benda, kata kerja, dll"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Contoh Kalimat (Jepang)
            </label>
            <input
              value={form.exampleJp}
              onChange={e => setForm({ ...form, exampleJp: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent font-jp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Terjemahan Contoh
            </label>
            <input
              value={form.exampleId}
              onChange={e => setForm({ ...form, exampleId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Tag (pisah koma)
            </label>
            <input
              value={form.tags.join(', ')}
              onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
              Catatan Pribadi
            </label>
            <textarea
              value={form.note || ''}
              onChange={e => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-surface dark:bg-dark-surface text-primary-text dark:text-dark-primary-text rounded-lg hover:bg-soft-accent dark:hover:bg-dark-border transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-accent dark:bg-dark-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
