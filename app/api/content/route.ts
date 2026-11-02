import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'bunpou' or 'kotoba'
  const file = searchParams.get('file'); // 'data.json'

  if (!type || !file) {
    return NextResponse.json(
      { error: 'type and file query parameters are required' },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), 'content', type, file);
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);
    return NextResponse.json(json);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
