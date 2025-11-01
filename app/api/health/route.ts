import { NextResponse } from 'next/server';
import { docsets, generations } from '@/app/lib/docsets-store';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    docsets: docsets.size,
    generations: generations.size
  });
}

