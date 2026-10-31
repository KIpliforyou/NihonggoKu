export interface BunpouExample {
  japanese: string;
  reading?: string;
  translation: string;
}

export interface Bunpou {
  id: string;
  pattern: string;
  meaning: string;
  function?: string;
  formation?: string;
  exampleJp?: string;
  exampleId?: string;
  note?: string;
  tags?: string[];
  examples?: BunpouExample[];
  createdAt: number;
  updatedAt: number;
  source?: 'bundled' | 'user';
  contentVersion?: string;
  contentId?: string;
}

export interface KotobaExample {
  japanese: string;
  translation: string;
}

export interface Kotoba {
  id: string;
  word: string;
  kanji?: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
  exampleJp?: string;
  exampleId?: string;
  note?: string;
  tags?: string[];
  examples?: KotobaExample[];
  createdAt: number;
  updatedAt: number;
  source?: 'bundled' | 'user';
  contentVersion?: string;
  contentId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  associatedBunpouId?: string;
  associatedKotobaId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FlashcardState {
  known: string[];
  lastStudied?: number;
}

export interface BunpouFlashcardState extends FlashcardState {}
export interface KotobaFlashcardState extends FlashcardState {}

export interface Progress {
  bunpou: {
    total: number;
    mastered: number;
    sessions: number;
    lastSession?: number;
  };
  kotoba: {
    total: number;
    mastered: number;
    sessions: number;
    lastSession?: number;
  };
  history: LearningSession[];
}

export interface LearningSession {
  id: string;
  type: 'bunpou' | 'kotoba';
  date: number;
  cardsStudied: number;
  cardsKnown: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  showFurigana: boolean;
  showMeaning: boolean;
}

// Content management types
export interface ContentManifest {
  manifestVersion: number;
  schemaVersion: string;
  contentVersion: string;
  lastUpdated: string;
  bunpouCount: number;
  kotobaCount: number;
  packName: string;
  packDescription: string;
}

export interface BunpouInput {
  id?: string;
  pattern: string;
  meaning: string;
  function?: string;
  formation?: string;
  exampleJp?: string;
  exampleId?: string;
  note?: string;
  tags?: string[];
  examples?: BunpouExample[];
}

export interface KotobaInput {
  id?: string;
  word: string;
  kanji?: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string;
  exampleJp?: string;
  exampleId?: string;
  note?: string;
  tags?: string[];
  examples?: KotobaExample[];
}

export interface ContentPack {
  manifest: ContentManifest;
  bunpou: BunpouInput[];
  kotoba: KotobaInput[];
}

export interface DeletionRecord {
  id: string;
  type: 'bunpou' | 'kotoba';
  originalId: string;
  deletedAt: number;
  reason?: string;
}

export interface ContentExport {
  exportVersion: string;
  exportDate: string;
  baseManifestVersion: string;
  baseContentVersion: string;
  bunpou: BunpouInput[];
  kotoba: KotobaInput[];
  deletions: DeletionRecord[];
  overrides: {
    bunpou?: BunpouInput[];
    kotoba?: KotobaInput[];
  };
}

export interface ValidationReport {
  valid: boolean;
  bunpou: {
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
    warnings: string[];
  };
  kotoba: {
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
    warnings: string[];
  };
  manifest: {
    valid: boolean;
    errors: string[];
  };
}

export interface MergeResult {
  newItems: number;
  updatedItems: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  bunpouErrors: string[];
  kotobaErrors: string[];
}
