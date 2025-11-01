import { NextRequest, NextResponse } from 'next/server';
import { docsets, generations } from '@/app/lib/docsets-store';

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

    if (docset.status !== 'ready') {
      return NextResponse.json(
        { error: 'Docset is not ready. Please upload documents first.' },
        { status: 400 }
      );
    }

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      content_prompt, 
      format_prompt, 
      section_label, 
      top_k = 8 
    } = body;

    if (!content_prompt || typeof content_prompt !== 'string') {
      return NextResponse.json(
        { error: 'content_prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Extract factory_id from query params
    const searchParams = request.nextUrl.searchParams;
    const factory_id = searchParams.get('factory_id') || docset.factory_id;

    // Call upstream API
    const response = await fetch(
      `${API_BASE_URL}/docsets/${id}/generate?factory_id=${factory_id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_prompt,
          format_prompt,
          section_label,
          top_k,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Generation failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate answer: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Store generation in local cache
    const generationId = data.generation_id;
    generations.set(generationId, {
      id: generationId,
      docset_id: id,
      generation_id: generationId,
      question: content_prompt,
      section_label: data.section_label,
      content: data.content,
      word_count: data.word_count,
      status: data.status,
      createdAt: data.created_at || new Date().toISOString(),
      completedAt: data.status === 'completed' ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({
      docset_id: data.docset_id,
      generation_id: data.generation_id,
      section_label: data.section_label,
      content: data.content,
      word_count: data.word_count,
      status: data.status,
      processing_time_ms: data.processing_time_ms,
      created_at: data.created_at,
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating answer:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

