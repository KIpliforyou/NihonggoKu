# NihonggoKu Content Sync Guide

## Overview

This guide explains how to use the content synchronization system to manage Japanese learning materials between AI Agents and the NihonggoKu application.

## Prerequisites

- Node.js >= 16
- npm >= 8
- Git (for version control)

## CLI Commands

### Validate Content

Check bundled content for structural issues:

```bash
npm run content:validate
```

Output:
```
=== Content Validator ===

Validating bundled content...
  Bunpou: 30/30 valid
  Kotoba: 100/100 valid
  Manifest: VALID

✓ Bundled content is valid
```

### Import Content (Dry Run)

Preview import without applying:

```bash
npm run content:import -- --file ./export.json --dry-run
```

Output:
```
=== Content Import Preview ===

Source: export.json
Manifest: VALID (v1.1.0)

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

### Import Content (Apply)

Apply imported changes:

```bash
npm run content:import -- --file ./export.json --apply
```

Output:
```
=== Content Import ===

Source: export.json
Manifest: VALID (v1.1.0)

Processing bunpou...
  + bp-new-001 added
  + bp-new-002 added
  ~ bp-001 updated
  × bp-conflict skipped (duplicate ID)

Processing kotoba...
  + kt-new-001 added
  ~ kt-001 updated

✓ Import completed: 7 added, 2 updated, 1 skipped
```

### Export User Content

Export user-created and modified materials:

```bash
npm run content:export [--file ./export.json]
```

Default output: `nihonggoku-content-export-YYYY-MM-DD.json`

## Workflows

### Workflow 1: Agent Adds New Content

1. Edit `content/bunpou/data.json` or `content/kotoba/data.json`
2. Update `content/manifest.json` with new counts and version
3. Run validation:
   ```bash
   npm run content:validate
   ```
4. Commit changes to Git
5. Next application deployment picks up new content

### Workflow 2: Agent Imports User Changes

1. Receive exported JSON from user
2. Inspect file:
   ```bash
   npm run content:import -- --file ./export.json --dry-run
   ```
3. Review preview for conflicts
4. Resolve any conflicts manually if needed
5. Apply import:
   ```bash
   npm run content:import -- --file ./export.json --apply
   ```
6. Commit changes to Git

### Workflow 3: User Exports Content

1. Navigate to Settings > "Export Konten untuk AI Agent"
2. Download JSON file
3. Send to AI Agent for processing

### Workflow 4: User Imports Agent Content

1. Navigate to Settings
2. Click "Import Paket Konten"
3. Select JSON file
4. Review preview
5. Confirm import

## Conflict Resolution

### Duplicate IDs

When an import contains an ID that already exists:

| Existing Source | Import Source | Action |
|-----------------|---------------|--------|
| bundled | bundled | Replace if version newer |
| user | bundled | Keep user version, report conflict |
| user | user | Skip, report error |
| bundled | user | Not possible (user imports rejected) |

### Missing Fields

Items missing required fields are skipped with error message:

```
✗ bp-001 skipped: missing 'pattern'
✗ kt-002 skipped: missing 'reading'
```

### Invalid JSON

Malformed files are rejected immediately:

```
✗ Invalid JSON: Unexpected token '}' at line 10
```

## Version Management

### Content Version

Track changes with semantic versions:

- `1.0.0` → `1.1.0`: Add new materials
- `1.1.0` → `1.2.0`: Update existing materials
- `1.2.0` → `2.0.0`: Major schema changes

### Detecting Changes

The application compares `contentVersion` on startup:

1. Read current version from `contentVersion` store
2. Read manifest version from `content/manifest.json`
3. If different, trigger merge
4. Update version store after merge

### Rollback

To rollback content changes:

1. Restore previous `content/` files from Git
2. Reset `contentVersion` store in IndexedDB
3. Clear `overrides` and `deletions` stores
4. Restart application

## Testing

### Test A: Agent adds new Bunpou

```bash
# 1. Add to content/bunpou/data.json
# 2. Update manifest
# 3. Validate
npm run content:validate

# Expected: 31/31 valid
```

### Test B: Agent adds new Kotoba

```bash
# 1. Add to content/kotoba/data.json
# 2. Update manifest
# 3. Validate
npm run content:validate

# Expected: 101/101 valid
```

### Test C: Import user export

```bash
# 1. Export from application
# 2. Import with dry-run
npm run content:import -- --file ./export.json --dry-run

# Expected: Preview shows user changes
```

### Test D: Invalid import

```bash
# 1. Create invalid JSON
# 2. Attempt import
npm run content:import -- --file ./invalid.json --dry-run

# Expected: Validation errors reported
```

## Troubleshooting

### "Content version mismatch"

If application reports version mismatch:

1. Check `content/manifest.json` version
2. Compare with IndexedDB `contentVersion` store
3. Run import to sync

### "Duplicate ID conflict"

If import shows conflicts:

1. Review dry-run output
2. Check which IDs conflict
3. Either remove from import or rename in source files

### "Validation failed"

If validation fails:

1. Check required fields
2. Verify unique IDs
3. Ensure valid JSON structure
4. Run validator for detailed report

## Best Practices

1. **Always validate before commit**
2. **Use dry-run to preview changes**
3. **Increment version for each change**
4. **Document changes in packDescription**
5. **Keep IDs stable across updates**
6. **Never overwrite user content directly**

## References

- [DATA_MODEL.md](./DATA_MODEL.md) - Data schema details
- [CONTENT_IMPORT_FORMAT.md](./CONTENT_IMPORT_FORMAT.md) - Import format specification
- [AGENTS.md](./AGENTS.md) - Agent integration guide
