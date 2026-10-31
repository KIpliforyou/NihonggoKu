import { NextResponse } from 'next/server';
import type { Kotoba } from '@/types';

// Client-side import only - API route not available for IndexedDB
export async function POST(request: Request) {
  return NextResponse.json({ error: 'Import must be done client-side' }, { status: 400 });
}
