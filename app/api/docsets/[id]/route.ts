import { NextRequest, NextResponse } from 'next/server';
import { docsets } from '@/app/lib/docsets-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docset = docsets.get(id);

    if (!docset) {
      return NextResponse.json(
        { error: 'Docset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      docset_id: docset.id,
      name: docset.name,
      description: docset.description,
      status: docset.status,
      documents: docset.documents,
      created_at: docset.createdAt,
      updated_at: docset.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching docset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch docset' },
      { status: 500 }
    );
  }
}

