# NihonggoKu

Aplikasi pembelajaran bahasa Jepang pribadi (local-first, tanpa AI/cloud).

## Fitur
- **Bunpou**: Tata bahasa Jepang (struktur kosong, siap diisi)
- **Kotoba**: Kosakata dengan furigana & contoh kalimat
- **Flashcards**: Latihan mengulang kosakata & tata bahasa
- **Notes**: Catatan pribadi
- **Progress**: Pantau perkembangan belajar
- **Import/Export**: Impor data dari file JSON
- **Dark/Light Mode**: Tema tampilan yang bisa dipilih
- **Global Search**: Cari semua konten sekaligus

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- IndexedDB (local storage)
- PWA-ready

## Cara Menjalankan

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm run start
```

## Impor Data JLPT N2
File JSON JLPT N2 sudah disiapkan di:
- `C:/Users/USER/workspace-fresh/nihonggoku_jlpt_n2_kotoba.json` (191 entri)

Cara impor:
1. Buka aplikasi di browser: http://localhost:3000
2. Klik menu "Impor Data" di sidebar
3. Paste isi file JSON ke textarea
4. Klik "Impor Sekarang"

## Struktur Project
```
nihonggoku/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── bunpou/page.tsx       # Bunpou list
│   ├── kotoba/page.tsx       # Kotoba list
│   ├── flashcards/page.tsx   # Flashcard practice
│   ├── notes/page.tsx        # Notes
│   ├── progress/page.tsx     # Progress tracking
│   ├── settings/page.tsx     # Settings
│   ├── import/page.tsx       # Import page
│   ├── api/                  # API routes
│   │   ├── delete/route.ts   # Delete item
│   │   └── import/kotoba/    # Import placeholder
│   ├── globals.css           # Global styles + theme vars
│   └── layout.tsx            # Root layout
├── components/
│   ├── Layout.tsx            # Main layout shell
│   ├── Sidebar.tsx           # Desktop sidebar nav
│   ├── Header.tsx            # Header with search/add
│   ├── MobileNav.tsx         # Mobile bottom nav
│   ├── QuickAddModal.tsx     # Quick add modal
│   ├── GlobalSearch.tsx      # Global search modal
│   ├── BunpouModal.tsx       # Bunpou form modal
│   └── KotobaModal.tsx       # Kotoba form modal
├── lib/
│   ├── db.ts                 # IndexedDB wrapper
│   └── utils.ts              # Utility functions
└── types/
    └── index.ts              # TypeScript interfaces
```

## IndexedDB Schema
- `bunpou`: Tata bahasa
- `kotoba`: Kosakata
- `notes`: Catatan
- `flashcardState`: State flashcard sesi
- `progress`: Progress belajar
- `settings`: Pengaturan aplikasi

## Theme Colors
### Light (Japanese Editorial Minimal)
- Background: #F7F6F2
- Surface: #FFFFFF
- Text: #252525
- Accent: #C65D46

### Dark (Dark Focus Studio)
- Background: #151820
- Surface: #202531
- Text: #F1F0EA
- Accent: #9D96E8
