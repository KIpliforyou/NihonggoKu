'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Download, Upload, Package, FileJson } from 'lucide-react';
import { get, update as updateSetting, getAll } from '@/lib/db';
import { exportUserContent } from '@/lib/contentManager';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showFurigana, setShowFurigana] = useState(true);
  const [language, setLanguage] = useState('id');
  const [contentVersion, setContentVersion] = useState<string | null>(null);
  const [bundledCount, setBundledCount] = useState({ bunpou: 0, kotoba: 0 });
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error' | 'confirming'>('idle');
  const [importError, setImportError] = useState<string>('');

  useEffect(() => {
    // Load saved settings
    const savedTheme = localStorage.getItem('nihonggoku-theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);

    // Load content stats
    const loadStats = async () => {
      try {
        const { getContentVersion } = await import('@/lib/contentManager');
        const { getAll } = await import('@/lib/db');

        const bunpou = await getAll('bunpou');
        const kotoba = await getAll('kotoba');
        const bundledBunpou = bunpou.filter((b: any) => b.source === 'bundled');
        const bundledKotoba = kotoba.filter((k: any) => k.source === 'bundled');
        setBundledCount({ bunpou: bundledBunpou.length, kotoba: bundledKotoba.length });

        const version = await getContentVersion();
        setContentVersion(version);
      } catch { /* ignore */ }
    };
    loadStats();
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('nihonggoku-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleExportContent = async () => {
    try {
      const data = await exportUserContent();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nihonggoku-content-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengekspor konten: ' + (e as Error).message);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const pack = JSON.parse(text);
      const { validateContentPack } = await import('@/lib/contentManager');
      const result = validateContentPack(pack);

      if (!result.valid) {
        setImportStatus('error');
        setImportError('Validasi gagal: ' + [...result.bunpou.errors, ...result.kotoba.errors, ...result.manifest.errors].join(', '));
        return;
      }

      const { getAll } = await import('@/lib/db');
      const existingBunpou = await getAll('bunpou');
      const existingKotoba = await getAll('kotoba');
      const bundledIds = new Set([
        ...existingBunpou.filter((b: any) => b.source === 'bundled').map((b: any) => b.id),
        ...existingKotoba.filter((k: any) => k.source === 'bundled').map((k: any) => k.id)
      ]);
      const conflicts = [
        ...(pack.bunpou || []).filter((b: any) => bundledIds.has(b.id)).length,
        ...(pack.kotoba || []).filter((k: any) => bundledIds.has(k.id)).length,
      ];

      setImportPreview({
        newBunpou: (pack.bunpou || []).length - conflicts.filter((_: any, i: number) => i < (pack.bunpou?.length || 0)).length,
        newKotoba: (pack.kotoba || []).length - conflicts.filter((_: any, i: number) => i >= (pack.bunpou?.length || 0)).length,
        updatedBunpou: conflicts.filter((_: any, i: number) => i < (pack.bunpou?.length || 0)).length,
        updatedKotoba: conflicts.filter((_: any, i: number) => i >= (pack.bunpou?.length || 0)).length,
        conflicts,
        errors: [],
      });
      setImportStatus('confirming');
      setImportError('');
    } catch (err) {
      setImportStatus('error');
      setImportError('Gagal membaca file: ' + (err as Error).message);
    }
  };

  const applyImport = async () => {
    if (!importPreview) return;
    const input = document.getElementById('import-file-input') as HTMLInputElement;
    if (!input?.files?.[0]) return;

    try {
      const text = await input.files[0].text();
      const pack = JSON.parse(text);
      const { mergeContent } = await import('@/lib/contentManager');
      const bundledContent = {
        manifest: pack.manifest || { contentVersion: '1.0.0' },
        bunpou: pack.bunpou || [],
        kotoba: pack.kotoba || [],
      };
      await mergeContent(bundledContent);
      setImportStatus('success');
      setImportPreview(null);

      // Refresh stats
      const { getAll } = await import('@/lib/db');
      const { getContentVersion } = await import('@/lib/contentManager');
      const bunpou = await getAll('bunpou');
      const kotoba = await getAll('kotoba');
      setBundledCount({
        bunpou: bunpou.filter((b: any) => b.source === 'bundled').length,
        kotoba: kotoba.filter((k: any) => k.source === 'bundled').length
      });
      setContentVersion(await getContentVersion());
    } catch (err) {
      setImportStatus('error');
      setImportError('Gagal mengimpor: ' + (err as Error).message);
    }
  };

  const handleExportBackup = async () => {
    try {
      const { getAll } = await import('@/lib/db');
      const bunpou = await getAll('bunpou');
      const kotoba = await getAll('kotoba');
      const notes = await getAll('notes');
      const progress = await getAll('progress');
      const flashcards = await getAll('flashcardState');
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        bunpou,
        kotoba,
        notes,
        progress,
        flashcardState: flashcards,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nihonggoku-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal mengekspor backup: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-text dark:text-dark-primary-text">Settings</h1>
        <p className="text-secondary-text dark:text-dark-secondary-text mt-1">
          Pengaturan aplikasi
        </p>
      </div>

      {/* Theme */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="text-accent dark:text-dark-accent" size={20} />
          <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Tema</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              theme === 'light'
                ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/20'
                : 'border-border dark:border-dark-border'
            }`}
          >
            <Sun className="mx-auto mb-2" size={24} />
            <p className={`text-sm ${theme === 'light' ? 'text-accent dark:text-dark-accent' : 'text-secondary-text dark:text-dark-secondary-text'}`}>
              Light
            </p>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              theme === 'dark'
                ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/20'
                : 'border-border dark:border-dark-border'
            }`}
          >
            <Moon className="mx-auto mb-2" size={24} />
            <p className={`text-sm ${theme === 'dark' ? 'text-accent dark:text-dark-accent' : 'text-secondary-text dark:text-dark-secondary-text'}`}>
              Dark
            </p>
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Tampilan
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primary-text dark:text-dark-primary-text">Tampilkan Furigana</p>
              <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
                Tampilkan cara baca di atas kanji
              </p>
            </div>
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`w-12 h-6 rounded-full transition-colors ${
                showFurigana ? 'bg-accent dark:bg-dark-accent' : 'bg-border dark:bg-dark-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                  showFurigana ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-accent dark:text-dark-accent" size={20} />
          <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text">Manajemen Konten</h2>
        </div>

        {/* Content Version Info */}
        <div className="mb-4 p-3 bg-soft dark:bg-dark-soft rounded-lg">
          <p className="text-sm text-primary-text dark:text-dark-primary-text">
            <span className="font-medium">Versi Konten:</span> {contentVersion || 'Belum diinstal'}
          </p>
          <p className="text-sm text-secondary-text dark:text-dark-secondary-text mt-1">
            Bundled: {bundledCount.bunpou} bunpou, {bundledCount.kotoba} kotoba
          </p>
        </div>

        {/* Export Content */}
        <button
          onClick={handleExportContent}
          className="w-full flex items-center gap-3 p-3 bg-soft-accent dark:bg-dark-border rounded-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-colors mb-3"
        >
          <FileJson className="text-accent dark:text-dark-accent" size={20} />
          <div className="text-left">
            <p className="font-medium text-primary-text dark:text-dark-primary-text">Export Konten untuk AI Agent</p>
            <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
              Ekspor materi buatan pengguna dalam format JSON
            </p>
          </div>
        </button>

        {/* Import Content */}
        <div className="space-y-3">
          <label className="w-full flex items-center gap-3 p-3 bg-soft-accent dark:bg-dark-border rounded-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-colors cursor-pointer">
            <Upload className="text-accent dark:text-dark-accent" size={20} />
            <div className="text-left flex-1">
              <p className="font-medium text-primary-text dark:text-dark-primary-text">Import Paket Konten</p>
              <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
                Impor file JSON dari AI Agent
              </p>
            </div>
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Import Preview */}
          {importStatus === 'confirming' && importPreview && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Pratinjau Impor</p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>Kotoba baru: {importPreview.newKotoba}</li>
                <li>Bunpou baru: {importPreview.newBunpou}</li>
                <li>Konflik (akan diperbarui): {importPreview.conflicts}</li>
              </ul>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={applyImport}
                  className="px-4 py-2 bg-accent dark:bg-dark-accent text-white rounded-lg text-sm hover:bg-accent/80 transition-colors"
                >
                  Terapkan
                </button>
                <button
                  onClick={() => { setImportStatus('idle'); setImportPreview(null); }}
                  className="px-4 py-2 bg-border dark:bg-dark-border text-primary-text dark:text-dark-primary-text rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {importStatus === 'success' && (
            <p className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
              ✓ Konten berhasil diimpor!
            </p>
          )}

          {importStatus === 'error' && (
            <p className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm">
              ✗ {importError}
            </p>
          )}
        </div>
      </div>

      {/* About */}
      <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
          Tentang
        </h2>
        <div className="space-y-2 text-sm text-secondary-text dark:text-dark-secondary-text">
          <p><span className="font-medium text-primary-text dark:text-dark-primary-text">NihonggoKu</span> v1.0.0</p>
          <p>Aplikasi pembelajaran bahasa Jepang pribadi</p>
          <p className="mt-2">Data disimpan secara lokal di browser Anda.</p>
        </div>
      </div>
    </div>
  );
}
