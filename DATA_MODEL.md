# NihonggoKu Data Model

## Overview

This document describes the data model used by NihonggoKu. All data is stored locally in the browser using IndexedDB.

## Database Schema

**Database Name**: `nihonggoku-db`
**Version**: 2 (upgraded from v1)

### Object Stores

| Store | Key Path | Description |
|-------|----------|-------------|
| `bunpou` | `id` | Grammar materials (bundled + user) |
| `kotoba` | `word` | Vocabulary materials (bundled + user) |
| `notes` | autoIncrement | User notes |
| `flashcardState` | `id` | Flashcard learning progress |
| `progress` | `id` | Learning progress tracking |
| `settings` | `key` | User settings |
| `contentVersion` | `'current'` | Current content pack version |
| `overrides` | `id` | User overrides of bundled content |
| `deletions` | autoIncrement | Deletion records (tombstones) |

## Content Types

### Bunpou (Grammar)

```typescript
interface Bunpou {
  id: string;              // Format: "bp-XXX" (e.g., "bp-001")
  pattern: string;         // Grammar pattern (required)
  meaning: string;         // Indonesian translation (required)
  explanation: string;     // Detailed explanation (required)
  formation: string;       // How to form (required)
  examples: BunpouExample[];
  tags?: string[];         // Optional tags
  source: 'bundled' | 'user';
  createdAt: number;       // Unix timestamp
  updatedAt: number;
  contentVersion: string;  // Content pack version
}

interface BunpouExample {
  japanese: string;
  reading?: string;
  translation: string;
}
```

### Kotoba (Vocabulary)

```typescript
interface Kotoba {
  id: string;              // Format: "kt-XXX" (e.g., "kt-001")
  word: string;            // Japanese word (required)
  kanji?: string;          // Kanji form (optional for kana)
  reading: string;         // Furigana reading (required)
  meaning: string;         // Indonesian translation (required)
  partOfSpeech?: string;   // Part of speech (optional)
  examples: KotobaExample[];
  tags?: string[];
  source: 'bundled' | 'user';
  createdAt: number;
  updatedAt: number;
  contentVersion: string;
}

interface KotobaExample {
  japanese: string;
  translation: string;
}
```

### DeletionRecord

```typescript
interface DeletionRecord {
  id: string;              // Format: "del-{timestamp}-{random}"
  type: 'bunpou' | 'kotoba';
  originalId: string;      // ID of deleted item
  deletedAt: number;
  reason: string;          // 'bundled content deleted' | 'user deleted'
}
```

### Override

```typescript
interface Override {
  id: string;              // Same as item.id
  type: 'bunpou' | 'kotoba';
  data: Bunpou | Kotoba;   // Modified content
  appliedAt: number;
}
```

### ContentManifest

```typescript
interface ContentManifest {
  manifestVersion: number; // Schema version (1)
  schemaVersion: number;   // Data schema version (1)
  contentVersion: string;  // Semantic version (e.g., "1.0.0")
  lastUpdated: string;     // ISO timestamp
  bunpouCount: number;
  kotobaCount: number;
  packName: string;
  packDescription: string;
}
```

## Merge Strategy

The effective library combines three sources:

1. **Bundled Content**: From `content/` directory
2. **User-Created Content**: Items with `source: 'user'`
3. **Overrides**: User modifications to bundled items

### Merge Rules

```
effective_bunpou = bundled_bunpou ∪ user_bunpou ∪ override_bunpou

where:
- user_bunpou filtered by deletions
- override_bunpou replaces matching bundled items
- deletions track removed items (tombstones)
```

### Conflict Resolution

| Scenario | Resolution |
|----------|------------|
| New bundled item, no conflict | Insert |
| Updated bundled item, no user edit | Replace with new version |
| Updated bundled item, user edited | Keep user version as override |
| Deleted bundled item | Create deletion record |
| Duplicate ID in import | Report error, skip |

## Flashcard State

```typescript
interface FlashcardState {
  id: string;              // Item ID (bunpou or kotoba)
  type: 'bunpou' | 'kotoba';
  known: string[];         // Previously Set<string>, now array
  lastReview: number;
  nextReview: number;
  reviewCount: number;
}
```

## Settings

```typescript
interface Setting {
  key: string;
  value: any;
  updatedAt: number;
}
```

Common keys:
- `nihonggoku-theme`: 'light' | 'dark'
- `nihonggoku-furigana`: boolean
- `nihonggoku-language`: 'id' | 'ja'

## Progress Tracking

```typescript
interface Progress {
  id: string;              // Item ID
  type: 'bunpou' | 'kotoba';
  mastery: number;         // 0-100
  lastReviewed: number;
  correctCount: number;
  wrongCount: number;
}
```

## Notes

```typescript
interface Note {
  id: number;              // autoIncrement
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

## Content Version Tracking

Stored in `contentVersion` store:

```typescript
interface ContentVersionRecord {
  key: 'current';
  version: string;         // e.g., "1.0.0"
  lastUpdated: number;
  bunpouCount: number;
  kotobaCount: number;
}
```

## Example Data

### Bunpou Example

```json
{
  "id": "bp-001",
  "pattern": "~ている",
  "meaning": "正在做某事",
  "explanation": "表示动作正在进行或状态持续",
  "formation": "动词て形 + いる",
  "examples": [
    {
      "japanese": "今、勉強しています",
      "reading": "べんきょうしています",
      "translation": "现在正在学习"
    }
  ],
  "tags": ["dasar", "进行时"],
  "source": "bundled",
  "createdAt": 1730380800000,
  "updatedAt": 1730380800000,
  "contentVersion": "1.0.0"
}
```

### Kotoba Example

```json
{
  "id": "kt-001",
  "word": "学校",
  "kanji": "学校",
  "reading": "がっこう",
  "meaning": "学校",
  "partOfSpeech": "nomina",
  "examples": [
    {
      "japanese": "学校に行きます",
      "translation": "去学校"
    }
  ],
  "tags": ["dasar", "地点"],
  "source": "bundled",
  "createdAt": 1730380800000,
  "updatedAt": 1730380800000,
  "contentVersion": "1.0.0"
}
```

## Indexes

IndexedDB automatically creates indexes for:
- `bunpou.id` (unique)
- `kotoba.word` (unique)
- `flashcardState.id` (unique)
- `settings.key` (unique)

Custom indexes may be added for:
- `bunpou.source`
- `kotoba.source`
- `progress.type`

## Migration History

### v1 → v2
- Added `contentVersion` store
- Added `overrides` store
- Added `deletions` store
- Changed `FlashcardState.known` from `Set<string>` to `string[]` (IndexedDB limitation)
- Added `source` field to Bunpou and Kotoba
