'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { add } from '@/lib/db';
import { Bunpou, Kotoba, Note } from '@/types';
import { generateId } from '@/lib/utils';

interface QuickAddModalProps {
  onClose: () => void;
}

export default function QuickAddModal({ onClose }: QuickAddModalProps) {
  const [mode, setMode] = useState<'bunpou' | 'kotoba' | 'note'>('bunpou');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const handleAddBunpou = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const bunpou: Bunpou = {
      id: generateId(),
      pattern: formData.get('pattern') as string,
      meaning: formData.get('meaning') as string,
      function: formData.get('function') as string,
      formation: formData.get('formation') as string,
      exampleJp: formData.get('exampleJp') as string,
      exampleId: formData.get('exampleId') as string,
      note: formData.get('note') as string || undefined,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await add('bunpou', bunpou);
    setLoading(false);
    handleClose();
  };

  const handleAddKotoba = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const kotoba: Kotoba = {
      id: generateId(),
      word: formData.get('word') as string,
      kanji: formData.get('kanji') as string,
      reading: formData.get('reading') as string,
      meaning: formData.get('meaning') as string,
      partOfSpeech: formData.get('partOfSpeech') as string || undefined,
      exampleJp: formData.get('exampleJp') as string || undefined,
      exampleId: formData.get('exampleId') as string || undefined,
      note: formData.get('note') as string || undefined,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await add('kotoba', kotoba);
    setLoading(false);
    handleClose();
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const note: Note = {
      id: generateId(),
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as string || undefined,
      tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await add('notes', note);
    setLoading(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">
            Quick Add
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-soft-accent dark:hover:bg-dark-border rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-border dark:border-dark-border">
          {(['bunpou', 'kotoba', 'note'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                mode === m
                  ? 'text-accent dark:text-dark-accent border-b-2 border-accent dark:border-dark-accent'
                  : 'text-secondary-text dark:text-dark-secondary-text hover:text-primary-text dark:hover:text-dark-primary-text'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Forms */}
        <div className="p-4">
          {mode === 'bunpou' && (
            <form onSubmit={handleAddBunpou} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Grammar Pattern *
                </label>
                <input name="pattern" required className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Meaning (Indonesian) *
                </label>
                <input name="meaning" required className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Function/Usage
                </label>
                <textarea name="function" rows={2} className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Formation/Pattern
                </label>
                <textarea name="formation" rows={2} className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Example (Japanese)
                </label>
                <input name="exampleJp" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Example Translation
                </label>
                <input name="exampleId" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Tags (comma separated)
                </label>
                <input name="tags" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Personal Note
                </label>
                <textarea name="note" rows={2} className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-accent dark:bg-dark-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Bunpou'}
              </button>
            </form>
          )}

          {mode === 'kotoba' && (
            <form onSubmit={handleAddKotoba} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Word (Japanese) *
                </label>
                <input name="word" required className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Kanji
                </label>
                <input name="kanji" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Reading (Hiragana)
                </label>
                <input name="reading" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Meaning (Indonesian) *
                </label>
                <input name="meaning" required className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Part of Speech
                </label>
                <input name="partOfSpeech" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Tags (comma separated)
                </label>
                <input name="tags" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-accent dark:bg-dark-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Kotoba'}
              </button>
            </form>
          )}

          {mode === 'note' && (
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Title *
                </label>
                <input name="title" required className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Content
                </label>
                <textarea name="content" rows={6} className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Category
                </label>
                <input name="category" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text dark:text-dark-primary-text mb-1">
                  Tags (comma separated)
                </label>
                <input name="tags" className="w-full px-3 py-2 rounded-lg bg-background dark:bg-dark-background text-primary-text dark:text-dark-primary-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-dark-accent" />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-accent dark:bg-dark-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
