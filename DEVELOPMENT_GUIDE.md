# NihonggoKu Development Guide

## Overview

This guide provides technical information for developers working on NihonggoKu.

## Project Structure

```
nihonggoku/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Dashboard
│   ├── bunpou/
│   │   └── page.tsx       # Grammar page
│   ├── kotoba/
│   │   └── page.tsx       # Vocabulary page
│   ├── flashcards/
│   │   └── page.tsx       # Flashcard study
│   ├── notes/
│   │   └── page.tsx       # Notes page
│   ├── progress/
│   │   └── page.tsx       # Progress tracking
│   ├── settings/
│   │   └── page.tsx       # Settings with content management
│   └── import/
│       └── page.tsx       # Content import tool
├── components/             # React components
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MobileNav.tsx
│   ├── BunpouModal.tsx
│   └── KotobaModal.tsx
├── lib/                    # Core libraries
│   ├── db.ts              # IndexedDB wrapper
│   ├── contentManager.ts  # Content management
│   └── utils.ts           # Utility functions
├── content/                # Bundled content
│   ├── manifest.json
│   ├── bunpou/
│   │   └── data.json
│   └── kotoba/
│       └── data.json
├── scripts/                # CLI tools
│   └── content-sync.js
├── types/
│   └── index.ts           # TypeScript interfaces
├── public/                 # Static assets
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (via idb library)
- **Icons**: lucide-react
- **Build**: npm scripts

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
cd "/c/Users/USER/Desktop/project HERMES AGENT/nihonggoku"
npm install
```

### Development Server

```bash
npm run dev
```

Server runs at http://localhost:3000

### Production Build

```bash
npm run build
```

## Database Schema

### IndexedDB Stores

| Store | Key Path | Purpose |
|-------|----------|---------|
| `bunpou` | `id` | Grammar materials |
| `kotoba` | `word` | Vocabulary materials |
| `notes` | autoIncrement | User notes |
| `flashcardState` | `id` | Flashcard progress |
| `progress` | `id` | Learning progress |
| `settings` | `key` | User settings |
| `contentVersion` | `'current'` | Content pack version |
| `overrides` | `id` | User overrides |
| `deletions` | autoIncrement | Tombstones |

### Database Upgrade

```typescript
// lib/db.ts
const upgrade = (event: IDBVersionChangeEvent) => {
  const db = (event.target as IDBOpenDBRequest).result;
  
  if (db.objectStoreNames.contains('contentVersion')) return;
  
  db.createObjectStore('contentVersion', { keyPath: 'key' });
  db.createObjectStore('overrides', { keyPath: 'id' });
  db.createObjectStore('deletions', { autoIncrement: true });
};
```

## Content Management

### ContentManager Class

```typescript
// lib/contentManager.ts
class ContentManager {
  async mergeContent(pack: ContentPack): Promise<ImportResult>;
  async validateContentPack(pack: ContentPack): Promise<ValidationResult>;
  async exportUserContent(): Promise<ExportData>;
  async installContentPack(pack: ContentPack): Promise<void>;
  async getContentVersion(): Promise<string>;
  async setContentVersion(version: string): Promise<void>;
  async addDeletionRecord(record: DeletionRecord): Promise<void>;
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `mergeContent()` | Merge bundled content with user data |
| `validateContentPack()` | Validate import file structure |
| `exportUserContent()` | Export user changes for AI processing |
| `getContentVersion()` | Get current content pack version |
| `addDeletionRecord()` | Track deleted items |

## CLI Commands

### Content Validation

```bash
npm run content:validate
```

### Content Import

```bash
# Dry run
npm run content:import -- --file ./export.json --dry-run

# Apply
npm run content:import -- --file ./export.json --apply
```

### Content Export

```bash
npm run content:export [--file ./export.json]
```

## API Routes

### DELETE /api/delete

Delete an item with deletion record:

```typescript
// POST /api/delete
{
  "store": "bunpou",
  "id": "bp-001"
}
```

Response:
```json
{
  "success": true,
  "deletionId": "del-1234567890"
}
```

## Testing

### Unit Tests

Currently no automated tests. Manual testing required.

### Integration Tests

Test scenarios documented in `AGENTS.md`:

1. Agent adds new Bunpou
2. Agent adds new Kotoba
3. User creates Bunpou item
4. User edits bundled grammar
5. Export content changes
6. Agent imports exported file
7. Application receives new bundled version
8. Import contains duplicates
9. Application update preserves data

### Manual Testing Checklist

- [ ] Add new grammar item via UI
- [ ] Add new vocabulary item via UI
- [ ] Edit existing bundled item
- [ ] Delete item (check tombstone)
- [ ] Export content
- [ ] Import content pack
- [ ] Switch theme (light/dark)
- [ ] Study flashcards
- [ ] Create note
- [ ] Check progress tracking

## Design System

### Colors

| Token | Light | Dark |
|-------|-------|------|
| `--primary-text` | #1a1a2e | #e8e8f0 |
| `--secondary-text` | #6c757d | #a0a0b0 |
| `--accent` | #4a90e2 | #5ba0f2 |
| `--surface` | #ffffff | #1e1e2e |
| `--soft` | #f8f9fa | #2a2a3a |
| `--border` | #dee2e6 | #3a3a4a |

### Typography

- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Base Size: 14px
- Scale: 1.25 (Major Third)

### Components

All components use Tailwind CSS utility classes. Follow existing patterns:

```tsx
<div className="bg-surface dark:bg-dark-surface rounded-xl border border-border dark:border-dark-border p-6">
  <h2 className="text-lg font-semibold text-primary-text dark:text-dark-primary-text mb-4">
    Section Title
  </h2>
  <p className="text-sm text-secondary-text dark:text-dark-secondary-text">
    Description
  </p>
</div>
```

## Adding New Content

### New Bunpou Item

1. Edit `content/bunpou/data.json`
2. Append new item to array
3. Update `content/manifest.json` bunpouCount
4. Run `npm run content:validate`

### New Kotoba Item

1. Edit `content/kotoba/data.json`
2. Append new item to array
3. Update `content/manifest.json` kotobaCount
4. Run `npm run content:validate`

### Updating Existing Item

1. Find item by ID in `content/bunpou/data.json` or `content/kotoba/data.json`
2. Replace with updated version
3. Update `updatedAt` timestamp
4. Bump `contentVersion` in manifest
5. Run validation

## Common Issues

### "indexedDB is not defined"

This error occurs in server-side code. Move IndexedDB operations to client-side components with `'use client'`.

### "Cannot find module"

Check import paths. Use absolute imports with `@/` prefix:

```typescript
import { get, add } from '@/lib/db';
import { mergeContent } from '@/lib/contentManager';
```

### Build Errors

Run TypeScript check:

```bash
npx tsc --noEmit
```

### Dev Server Port Conflict

Kill existing process:

```bash
taskkill /F /PID <pid>
```

Clear cache and restart:

```bash
rm -rf .next
npm run dev
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Documentation

- [AGENTS.md](./AGENTS.md) - Agent integration guide
- [DATA_MODEL.md](./DATA_MODEL.md) - Data schema
- [CONTENT_IMPORT_FORMAT.md](./CONTENT_IMPORT_FORMAT.md) - Import format
- [CONTENT_SYNC_GUIDE.md](./CONTENT_SYNC_GUIDE.md) - Sync workflows

## Support

For issues or questions, consult the Hermes Agent documentation:
https://hermes-agent.nousresearch.com/docs
