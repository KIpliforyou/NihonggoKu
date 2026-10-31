'use client';

import { useState, useEffect } from 'react';
import { getAll } from '@/lib/db';
import type { Bunpou, Kotoba } from '@/types';
import Link from 'next/link';
import { BookOpen, ArrowRight, FileText } from 'lucide-react';

export default function Dashboard() {
  const [bunpou, setBunpou] = useState<Bunpou[]>([]);
  const [kotoba, setKotoba] = useState<Kotoba[]>([]);

  useEffect(() => {
    getAll<Bunpou>('bunpou').then(setBunpou);
    getAll<Kotoba>('kotoba').then(setKotoba);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary-text dark:text-dark-primary-text">
          Selamat Datang di NihonggoKu
        </h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-2">
          Ruang belajar Jepang pribadimu. Mulai dengan menambahkan materi atau berlatih flashcard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {bunpou.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Bunpou</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <FileText className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {kotoba.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Kotoba</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <BookOpen className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            0
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Flashcard</p>
        </div>
        <div className="bg-surface dark:bg-dark-surface p-4 rounded-xl border border-border dark:border-dark-border">
          <ArrowRight className="text-accent dark:text-dark-accent" size={24} />
          <p className="text-2xl font-bold text-primary-text dark:text-dark-primary-text mt-2">
            {bunpou.length + kotoba.length}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text">Total</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/bunpou"
            className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border hover:border-accent dark:hover:border-dark-accent transition-colors"
          >
            <BookOpen className="text-accent dark:text-dark-accent" size={24} />
            <h3 className="font-medium text-primary-text dark:text-dark-primary-text mt-2">Tambah Bunpou</h3>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">Kelola materi tata bahasa</p>
          </Link>
          <Link
            href="/kotoba"
            className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border hover:border-accent dark:hover:border-dark-accent transition-colors"
          >
            <FileText className="text-accent dark:text-dark-accent" size={24} />
            <h3 className="font-medium text-primary-text dark:text-dark-primary-text mt-2">Tambah Kotoba</h3>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">Kelola kosakata Jepang</p>
          </Link>
          <Link
            href="/flashcards"
            className="p-4 bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border hover:border-accent dark:hover:border-dark-accent transition-colors"
          >
            <BookOpen className="text-accent dark:text-dark-accent" size={24} />
            <h3 className="font-medium text-primary-text dark:text-dark-primary-text mt-2">Mulai Flashcard</h3>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">Latih ingatanmu</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Aktivitas Terbaru
        </h2>
        <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-4">
          {bunpou.length === 0 && kotoba.length === 0 ? (
            <p className="text-center text-secondary-text dark:text-dark-secondary-text py-8">
              Belum ada materi. Mulai tambahkan bunpou atau kotoba pertamamu!
            </p>
          ) : (
            <div className="space-y-3">
              {bunpou.slice(-3).reverse().map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border last:border-0">
                  <div>
                    <p className="font-medium text-primary-text dark:text-dark-primary-text">{item.pattern}</p>
                    <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{item.meaning}</p>
                  </div>
                  <span className="text-xs text-secondary-text dark:text-dark-secondary-text">Bunpou</span>
                </div>
              ))}
              {kotoba.slice(-3).reverse().map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border dark:border-dark-border last:border-0">
                  <div>
                    <p className="font-medium text-primary-text dark:text-dark-primary-text">{item.word}</p>
                    <p className="text-sm text-secondary-text dark:text-dark-secondary-text">{item.meaning}</p>
                  </div>
                  <span className="text-xs text-secondary-text dark:text-dark-secondary-text">Kotoba</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
