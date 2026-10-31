# NihonggoKu Agent Integration Guide

## Overview

NihonggoKu is a personal Japanese learning application with a two-way content management system. This document explains how external AI Agents can interact with the project to add, update, or remove learning materials.

## Content Architecture

The application uses two content sources:

1. **Agent-Managed Content**: Stored in `content/` directory, tracked by Git
2. **User-Managed Content**: Stored in IndexedDB (browser-side)

Both sources combine into an effective learning library through a merge system.

## Directory Structure

```
content/
  manifest.json          # Content pack metadata
  bunpou/
    data.json            # Grammar materials
  kotoba/
    data.json            # Vocabulary materials
scripts/
  content-sync.js        # CLI tool for validation and import
```

## Content Schemas

### Bunpou (Grammar) Schema

```typescript
interface Bunpou {
  id: string;              // Stable unique ID (e.g., "bp-001")
  pattern: string;         // Grammar pattern (e.g., "~ている")
  meaning: string;         // Indonesian translation of meaning
  explanation: string;     // Grammar explanation
  formation: string;       // How to form this grammar
  examples: BunpouExample[];
  tags?: string[];         // Optional tags (e.g., ["dasar", "waktu"])
  source: 'bundled' | 'user';
  createdAt: number;
  updatedAt: number;
  contentVersion: string;
}

interface BunpouExample {
  japanese: string;
  reading?: string;
  translation: string;
}
```

### Kotoba (Vocabulary) Schema

```typescript
interface Kotoba {
  id: string;              // Stable unique ID (e.g., "kt-001")
  word: string;            // Japanese word
  kanji?: string;          // Kanji form (optional for kana words)
  reading: string;         // Furigana reading
  meaning: string;         // Indonesian translation
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

### Content Manifest Schema

```typescript
interface ContentManifest {
  manifestVersion: number;   // Schema version (currently 1)
  schemaVersion: number;     // Data schema version (currently 1)
  contentVersion: string;    // Semantic version (e.g., "1.0.0")
  lastUpdated: string;       // ISO timestamp
  bunpouCount: number;       // Number of bunpou items
  kotobaCount: number;       // Number of kotoba items
  packName: string;          // Pack identifier
  packDescription: string;   // Pack description
}
```

## Workflow: Agent → Application

### Step 1: Create or Update Content Files

Edit `content/bunpou/data.json` or `content/kotoba/data.json` to add/update materials.

**Adding new items**: Append to the array.
**Updating existing items**: Replace the item with matching `id`.
**Removing items**: Remove from array (deletion records will be created on next import).

### Step 2: Update Manifest

Edit `content/manifest.json` to reflect new counts and version:

```json
{
  "manifestVersion": 1,
  "schemaVersion": 1,
  "contentVersion": "1.1.0",
  "lastUpdated": "2026-10-31T00:00:00.000Z",
  "bunpouCount": 30,
  "kotobaCount": 100,
  "packName": "nihonggoku-default",
  "packDescription": "NihonggoKu default content pack"
}
```

### Step 3: Validate

Run validation to check content structure:

```bash
cd /path/to/nihonggoku
npm run content:validate
```

Expected output:
```
=== Content Validator ===

Validating bundled content...
  Bunpou: 30/30 valid
  Kotoba: 100/100 valid
  Manifest: VALID

✓ Bundled content is valid
```

### Step 4: Import (Optional - for testing)

To test import without full application deployment:

```bash
npm run content:import -- --file ./content/bunpou/data.json --dry-run
```

## Workflow: Application → Agent

### Export User Content

Users can export their created/modified materials via Settings > "Export Konten untuk AI Agent".

Export format:

```json
{
  "exportDate": "2026-10-31T00:00:00.000Z",
  "version": "1.0.0",
  "baseManifestVersion": "1.0.0",
  "bunpou": [
    {
      "id": "bp-user-001",
      "pattern": "~ておく",
      "meaning": "事先做好",
      "source": "user",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "kotoba": [
    {
      "id": "kt-user-001",
      "word": "勉強",
      "reading": "べんきょう",
      "meaning": "学习",
      "source": "user",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "overrides": [
    {
      "id": "bp-001",
      "type": "bunpou",
      "data": { /* modified item */ }
    }
  ],
  "deletions": [
    {
      "id": "del-xxx",
      "type": "bunpou",
      "originalId": "bp-002",
      "deletedAt": 1234567890,
      "reason": "user deleted"
    }
  ]
}
```

### Step 5: Agent Processes Export

1. Inspect exported JSON
2. Identify new user materials, modifications, deletions
3. Incorporate approved changes into `content/` files
4. Run validation
5. Commit to Git

## Conflict Resolution Rules

1. **User-created content never disappears** during updates
2. **User edits stored as overrides**, not written to source
3. **Bundled updates don't overwrite local overrides**
4. **Deleted bundled materials tracked via deletion records**
5. **Duplicate IDs detected and reported**
6. **Import conflicts reported, not silently resolved**

## Versioning

Content versioning is independent from application versioning.

- `contentVersion`: Semantic version of content pack (e.g., "1.0.0")
- `schemaVersion`: Data schema version (currently 1)
- `manifestVersion`: Manifest format version (currently 1)

When content changes:
1. Update `contentVersion` in manifest
2. Run validation
3. Next application startup detects version change
4. Content Manager safely merges new materials
5. Learning progress preserved via stable IDs

## CLI Reference

```bash
# Validate bundled content
npm run content:validate

# Import exported content (dry-run first)
npm run content:import -- --file ./export.json --dry-run

# Apply import
npm run content:import -- --file ./export.json --apply

# Export user content
npm run content:export [--file ./export.json]
```

## Testing Scenarios

### Test A: Agent adds new Bunpou
1. Add item to `content/bunpou/data.json`
2. Update manifest count
3. Run `npm run content:validate`
4. Import via application or CLI
5. Verify new grammar appears in `/bunpou` page

### Test B: Agent adds new Kotoba
1. Add item to `content/kotoba/data.json`
2. Update manifest count
3. Run validation
4. Import
5. Verify new vocabulary appears in `/kotoba` page

### Test C: User creates Bunpou item
1. Use Bunpou page to add new item
2. Refresh application
3. Verify item persists

### Test D: User edits bundled grammar
1. Edit existing bundled item
2. Verify change stored as override
3. Verify source file unchanged

### Test E: Export content changes
1. Create/edit/delete items in application
2. Go to Settings > "Export Konten untuk AI Agent"
3. Verify valid JSON file generated

### Test F: Agent imports exported file
1. Take exported JSON
2. Run `npm run content:import -- --file ./export.json --dry-run`
3. Inspect preview
4. Apply if satisfied
5. Verify changes merged

### Test G: Application receives new bundled version
1. Update `content/` files
2. Increment `contentVersion`
3. Restart application
4. Verify accepted changes appear
5. Verify no duplicates

### Test H: Import contains duplicates/invalid
1. Create invalid JSON (missing required fields)
2. Attempt import
3. Verify rejection with clear error report

### Test I: Application update preserves data
1. Create user content
2. Update application
3. Verify user content, notes, progress intact

## Security & Privacy

- All data stored locally in browser (IndexedDB)
- No cloud synchronization
- No personal data exported in content export
- Export only includes materials, not notes or progress

## Troubleshooting

### Validation fails
- Check all required fields present
- Ensure unique IDs
- Verify Japanese translations accurate
- Run `npm run content:validate` for detailed report

### Import conflicts
- Review conflict report before applying
- Check for duplicate IDs
- Verify existing overrides not overwritten

### Build errors
- Run `npm run build` to check TypeScript errors
- Fix type annotations as needed
- Re-run validation

## Contact

For issues or questions, consult the Hermes Agent documentation at https://hermes-agent.nousresearch.com/docs
