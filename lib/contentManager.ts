import type { Bunpou, Kotoba } from '../types';
import { getAll, add, put, deleteItem, openDB } from './db';

const STORES = {
  BUNPOU: 'bunpou',
  KOTOBA: 'kotoba',
  SETTINGS: 'settings',
};

/** Get the current installed content version */
export async function getContentVersion(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('contentVersion', 'readonly');
      const store = tx.objectStore('contentVersion');
      const req = store.get('current');
      req.onsuccess = () => resolve(req.result?.version || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

/** Save the current content version */
export async function setContentVersion(version: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contentVersion', 'readwrite');
    const store = tx.objectStore('contentVersion');
    store.put({ key: 'current', version, installedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Validate a single Bunpou item */
export function validateBunpou(item: Partial<Bunpou>, index: number): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!item.id) errors.push(`Item #${index + 1}: missing id`);
  if (!item.pattern) errors.push(`Item #${index + 1}: missing pattern`);
  if (!item.meaning) errors.push(`Item #${index + 1}: missing meaning`);
  if (item.examples && Array.isArray(item.examples)) {
    item.examples.forEach((ex, i) => {
      if (!ex.japanese) warnings.push(`Item #${index + 1} example #${i + 1}: missing japanese`);
      if (!ex.translation) warnings.push(`Item #${index + 1} example #${i + 1}: missing translation`);
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

/** Validate a single Kotoba item */
export function validateKotoba(item: Partial<Kotoba>, index: number): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!item.id) errors.push(`Item #${index + 1}: missing id`);
  if (!item.word) errors.push(`Item #${index + 1}: missing word`);
  if (!item.reading) errors.push(`Item #${index + 1}: missing reading`);
  if (!item.meaning) errors.push(`Item #${index + 1}: missing meaning`);
  if (item.examples && Array.isArray(item.examples)) {
    item.examples.forEach((ex, i) => {
      if (!ex.japanese) warnings.push(`Item #${index + 1} example #${i + 1}: missing japanese`);
      if (!ex.translation) warnings.push(`Item #${index + 1} example #${i + 1}: missing translation`);
    });
  }
  return { valid: errors.length === 0, errors, warnings };
}

export interface ValidationResult {
  valid: boolean;
  bunpou: { total: number; valid: number; invalid: number; errors: string[]; warnings: string[] };
  kotoba: { total: number; valid: number; invalid: number; errors: string[]; warnings: string[] };
  manifest: { valid: boolean; errors: string[] };
}

export function validateContentPack(pack: any): ValidationResult {
  const report: ValidationResult = {
    valid: true,
    bunpou: { total: 0, valid: 0, invalid: 0, errors: [], warnings: [] },
    kotoba: { total: 0, valid: 0, invalid: 0, errors: [], warnings: [] },
    manifest: { valid: true, errors: [] },
  };
  if (pack.manifest) {
    if (!pack.manifest.manifestVersion) report.manifest.errors.push('Missing manifestVersion');
    if (!pack.manifest.schemaVersion) report.manifest.errors.push('Missing schemaVersion');
    if (!pack.manifest.contentVersion) report.manifest.errors.push('Missing contentVersion');
    if (!pack.manifest.lastUpdated) report.manifest.errors.push('Missing lastUpdated');
    if (!pack.manifest.packName) report.manifest.errors.push('Missing packName');
  }
  if (Array.isArray(pack.bunpou)) {
    report.bunpou.total = pack.bunpou.length;
    for (let i = 0; i < pack.bunpou.length; i++) {
      const r = validateBunpou(pack.bunpou[i], i);
      if (r.valid) report.bunpou.valid++; else { report.bunpou.invalid++; report.bunpou.errors.push(...r.errors); }
      report.bunpou.warnings.push(...r.warnings);
    }
  }
  if (Array.isArray(pack.kotoba)) {
    report.kotoba.total = pack.kotoba.length;
    for (let i = 0; i < pack.kotoba.length; i++) {
      const r = validateKotoba(pack.kotoba[i], i);
      if (r.valid) report.kotoba.valid++; else { report.kotoba.invalid++; report.kotoba.errors.push(...r.errors); }
      report.kotoba.warnings.push(...r.warnings);
    }
  }
  report.valid = report.manifest.errors.length === 0 && report.bunpou.invalid === 0 && report.kotoba.invalid === 0;
  return report;
}

export interface MergeResult {
  newItems: number; updatedItems: number; skippedDuplicates: number;
  skippedInvalid: number; bunpouErrors: string[]; kotobaErrors: string[];
}

export async function mergeContent(
  bundledContent: { manifest: any; bunpou: Bunpou[]; kotoba: Kotoba[] },
  dryRun = false
): Promise<MergeResult> {
  const result: MergeResult = { newItems: 0, updatedItems: 0, skippedDuplicates: 0, skippedInvalid: 0, bunpouErrors: [], kotobaErrors: [] };
  const existingBunpou = await getAll(STORES.BUNPOU) as Bunpou[];
  const existingKotoba = await getAll(STORES.KOTOBA) as Kotoba[];
  const bundledBunpou = bundledContent.bunpou || [];
  const bundledKotoba = bundledContent.kotoba || [];

  for (const item of bundledBunpou) {
    const v = validateBunpou(item, 0);
    if (!v.valid) { result.skippedInvalid++; result.bunpouErrors.push(...v.errors); continue; }
    const existing = existingBunpou.find((b) => b.id === item.id);
    if (existing) {
      if (item.contentVersion && existing.contentVersion !== item.contentVersion) {
        if (!dryRun) await put(STORES.BUNPOU, { ...existing, ...item, updatedAt: Date.now() });
        result.updatedItems++;
      } else { result.skippedDuplicates++; }
    } else {
      if (!dryRun) await add(STORES.BUNPOU, { ...item, source: 'bundled' as const, createdAt: Date.now(), updatedAt: Date.now() });
      result.newItems++;
    }
  }

  for (const item of bundledKotoba) {
    const v = validateKotoba(item, 0);
    if (!v.valid) { result.skippedInvalid++; result.kotobaErrors.push(...v.errors); continue; }
    const existing = existingKotoba.find((k) => k.id === item.id);
    if (existing) {
      if (item.contentVersion && existing.contentVersion !== item.contentVersion) {
        if (!dryRun) await put(STORES.KOTOBA, { ...existing, ...item, updatedAt: Date.now() });
        result.updatedItems++;
      } else { result.skippedDuplicates++; }
    } else {
      if (!dryRun) await add(STORES.KOTOBA, { ...item, source: 'bundled' as const, createdAt: Date.now(), updatedAt: Date.now() });
      result.newItems++;
    }
  }

  if (!dryRun) await setContentVersion(bundledContent.manifest?.contentVersion || '1.0.0');
  return result;
}

export interface ExportData {
  exportVersion: string; exportDate: string; baseManifestVersion: string; baseContentVersion: string;
  bunpou: any[]; kotoba: any[]; deletions: any[]; overrides: { bunpou: any[]; kotoba: any[] };
}

export async function exportUserContent(): Promise<ExportData> {
  const bunpou = await getAll(STORES.BUNPOU) as Bunpou[];
  const kotoba = await getAll(STORES.KOTOBA) as Kotoba[];
  const deletions = await getAll('deletions') as Array<{ id: string; type: string; originalId: string; deletedAt: number; reason: string }>;
  const overrides = await getAll('overrides') as Array<{ id: string; type: string; data: any; appliedAt: number }>;
  const currentVersion = await getContentVersion();

  return {
    exportVersion: '1.0.0',
    exportDate: new Date().toISOString(),
    baseManifestVersion: '1',
    baseContentVersion: currentVersion || 'unknown',
    bunpou: bunpou.filter((b) => b.source === 'user').map((b) => ({
      id: b.id, pattern: b.pattern, meaning: b.meaning, function: b.function, formation: b.formation,
      exampleJp: b.exampleJp, exampleId: b.exampleId, note: b.note, tags: b.tags, examples: b.examples,
      source: b.source, contentVersion: b.contentVersion, contentId: b.contentId,
      createdAt: b.createdAt, updatedAt: b.updatedAt,
    })),
    kotoba: kotoba.filter((k) => k.source === 'user').map((k) => ({
      id: k.id, word: k.word, kanji: k.kanji, reading: k.reading, meaning: k.meaning,
      partOfSpeech: k.partOfSpeech, exampleJp: k.exampleJp, exampleId: k.exampleId, note: k.note,
      tags: k.tags, examples: k.examples, source: k.source, contentVersion: k.contentVersion,
      contentId: k.contentId, createdAt: k.createdAt, updatedAt: k.updatedAt,
    })),
    deletions: deletions.map((d) => ({ id: d.id, type: d.type, originalId: d.originalId, deletedAt: d.deletedAt, reason: d.reason })),
    overrides: {
      bunpou: overrides.filter((o) => o.type === 'bunpou').map((o) => o.data),
      kotoba: overrides.filter((o) => o.type === 'kotoba').map((o) => o.data),
    },
  };
}

export async function applyOverride(type: string, item: any): Promise<void> {
  const overrides = await getAll('overrides');
  const existing = overrides.find((o: any) => o.id === item.id && o.type === type);
  if (existing) {
    await put('overrides', { ...existing, data: item, appliedAt: Date.now() });
  } else {
    await add('overrides', { id: item.id, type, data: item, appliedAt: Date.now() });
  }
}

export async function deleteWithRecord(storeName: string, id: string, type: string): Promise<void> {
  const items = await getAll(storeName);
  const item = items.find((i: any) => i.id === id);
  await deleteItem(storeName, id);
  const deletionRecord = {
    id: `del-${Date.now()}-${Math.random().toString(36).substring(2)}`,
    type, originalId: id, deletedAt: Date.now(),
    reason: (item as any)?.source === 'bundled' ? 'bundled content deleted' : 'user deleted',
  };
  await add('deletions', deletionRecord);
}

export { STORES };
