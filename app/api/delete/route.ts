import { NextResponse } from 'next/server';
import { deleteItem } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { store, id } = body;
    
    if (!store || !id) {
      return NextResponse.json({ error: 'Missing store or id' }, { status: 400 });
    }
    
    await deleteItem(store, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
