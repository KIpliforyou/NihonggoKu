# NihonggoKu Content Import Format

## Overview

This document describes the JSON format for importing content packs into NihonggoKu. Both AI Agents and users can generate import files.

## File Structure

An import file must be a valid JSON object with the following structure:

```json
{
  "manifest": {
    "manifestVersion": 1,
    "schemaVersion": 1,
    "contentVersion": "1.0.0",
    "lastUpdated": "2026-10-31T00:00:00.000Z",
    "bunpouCount": 30,
    "kotobaCount": 100,
    "packName": "nihonggoku-default",
    "packDescription": "Default content pack"
  },
  "bunpou": [...],
  "kotoba": [...]
}
```

## Manifest Requirements

The `manifest` object is required and must contain:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifestVersion` | number | Yes | Must be 1 |
| `schemaVersion` | number | Yes | Must be 1 |
| `contentVersion` | string | Yes | Semantic version (e.g., "1.0.0") |
| `lastUpdated` | string | Yes | ISO 8601 timestamp |
| `bunpouCount` | number | Yes | Number of bunpou items |
| `kotobaCount` | number | Yes | Number of kotoba items |
| `packName` | string | Yes | Unique pack identifier |
| `packDescription` | string | Yes | Human-readable description |

## Bunpou Array Requirements

The `bunpou` array contains grammar materials. Each item must have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "bp-001") |
| `pattern` | string | Yes | Grammar pattern |
| `meaning` | string | Yes | Indonesian translation |
| `explanation` | string | Yes | Grammar explanation |
| `formation` | string | Yes | Formation rule |
| `examples` | array | Yes | List of examples |
| `source` | string | Yes | Must be "bundled" |
| `createdAt` | number | Yes | Unix timestamp |
| `updatedAt` | number | Yes | Unix timestamp |
| `contentVersion` | string | Yes | Content version |

### Example Bunpou Item

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
  "source": "bundled",
  "createdAt": 1730380800000,
  "updatedAt": 1730380800000,
  "contentVersion": "1.0.0"
}
```

## Kotoba Array Requirements

The `kotoba` array contains vocabulary materials. Each item must have:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., "kt-001") |
| `word` | string | Yes | Japanese word |
| `reading` | string | Yes | Furigana reading |
| `meaning` | string | Yes | Indonesian translation |
| `examples` | array | Yes | List of examples |
| `source` | string | Yes | Must be "bundled" |
| `createdAt` | number | Yes | Unix timestamp |
| `updatedAt` | number | Yes | Unix timestamp |
| `contentVersion` | string | Yes | Content version |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `kanji` | string | Kanji form (for kana words) |
| `partOfSpeech` | string | Part of speech |
| `tags` | array | Tags for filtering |

### Example Kotoba Item

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

## Validation Rules

The import system validates against these rules:

### Structural Validation

1. **Required fields present**: All mandatory fields must exist
2. **Valid data types**: Fields must match expected types
3. **Unique IDs**: No duplicate IDs within the import file
4. **Valid JSON structure**: File must parse correctly
5. **Empty fields**: No empty strings in required fields
6. **Valid examples**: Each example must have required fields
7. **Missing translations**: Indonesian translations required
8. **Unsupported schema versions**: Only schemaVersion 1 supported

### Linguistic Validation (Recommended)

While not enforced by the system, agents should ensure:
- Japanese sentences are natural and grammatically correct
- Translations are accurate
- Readings match the kanji/kana used
- Examples demonstrate proper usage

## Import Process

### Step 1: Validate

```bash
npm run content:validate
```

This checks all bundled content for structural issues.

### Step 2: Preview Import (Dry Run)

```bash
npm run content:import -- --file ./export.json --dry-run
```

Output shows:
```
=== Content Import Preview ===

Source: export.json
Manifest: VALID (v1.0.0)

New Items:
  Bunpou: 5 new
  Kotoba: 10 new

Updated Items:
  Bunpou: 2 updated
  Kotoba: 3 updated

Conflicts:
  Bunpou: 1 duplicate ID
  Kotoba: 0 duplicate IDs

Invalid Items:
  None

✓ Import preview generated successfully
```

### Step 3: Apply Import

```bash
npm run content:import -- --file ./export.json --apply
```

### Step 4: User Confirmation (UI Import)

When importing via Settings page:
1. User selects JSON file
2. System validates structure
3. Preview shown with new/updated/conflict counts
4. User confirms before applying
5. Import applied atomically

## Error Handling

### Validation Errors

If validation fails, import is rejected with detailed error report:

```
=== Validation Errors ===

Manifest:
  - Missing required field: 'contentVersion'
  
Bunpou:
  - Item #3: missing 'pattern'
  - Item #7: duplicate ID 'bp-001'
  
Kotoba:
  - Item #12: missing 'reading'
  - Item #15: empty 'meaning'

✗ Import rejected due to validation errors
```

### Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| Duplicate ID in import | Error, skip item |
| ID exists in bundled, no user edit | Replace with new version |
| ID exists in bundled, user edited | Keep user version, report conflict |
| ID exists in user content | Error, skip (would overwrite user data) |

## Export Format

User exports include additional fields not present in agent imports:

```json
{
  "exportDate": "2026-10-31T00:00:00.000Z",
  "version": "1.0.0",
  "baseManifestVersion": "1.0.0",
  "bunpou": [...],
  "kotoba": [...],
  "overrides": [...],
  "deletions": [...]
}
```

## Best Practices

1. **Use stable IDs**: Format as `bp-XXX` and `kt-XXX`
2. **Increment version**: Bump `contentVersion` for each change
3. **Validate before commit**: Run `npm run content:validate`
4. **Dry run first**: Test with `--dry-run` before applying
5. **Preserve user data**: Never overwrite user-created items
6. **Document changes**: Update `packDescription` with changelog

## Example Complete Import

See `content/manifest.json`, `content/bunpou/data.json`, and `content/kotoba/data.json` for complete examples.
