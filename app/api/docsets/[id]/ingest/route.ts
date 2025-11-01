import { NextRequest, NextResponse } from 'next/server';
import { docsets } from '@/app/lib/docsets-store';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function POST(
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

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const source_type = formData.get('source_type') as string || 'contract';
    const factory_id = formData.get('factory_id') as string || docset.factory_id;
    const doc_tags = formData.get('doc_tags') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Forward to upstream API
    const upstreamFormData = new FormData();
    upstreamFormData.append('file', file);
    upstreamFormData.append('source_type', source_type);
    upstreamFormData.append('factory_id', factory_id);
    if (doc_tags) {
      upstreamFormData.append('doc_tags', doc_tags);
    }

    const response = await fetch(`${API_BASE_URL}/docsets/${id}/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Document ingestion failed:', response.status, errorText);
      let errorMessage = `Failed to ingest document: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If parsing fails, use the error text as-is if it's short
        if (errorText && errorText.length < 200) {
          errorMessage = errorText;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Update local cache
    docset.documents.push({
      doc_id: data.doc_id,
      status: data.status,
      source_type,
      doc_tags: doc_tags ? doc_tags.split(',').map(t => t.trim()) : [],
      chunks: data.chunks,
      vectors: data.vectors,
      uploadedAt: new Date().toISOString(),
    });
    docset.status = 'ready';
    docset.updatedAt = new Date().toISOString();
    docsets.set(id, docset);

    return NextResponse.json({
      doc_id: data.doc_id,
      status: data.status,
      chunks: data.chunks,
      vectors: data.vectors,
      processing_time_ms: data.processing_time_ms,
      message: data.message,
    }, { status: 200 });

  } catch (error) {
    console.error('Error ingesting document:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

