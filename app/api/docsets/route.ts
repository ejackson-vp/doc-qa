import { NextRequest, NextResponse } from 'next/server';
import { docsets } from '@/app/lib/docsets-store';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, factory_id = 'default', user_id = 'anonymous' } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    // Create docset via upstream API
    const response = await fetch(`${API_BASE_URL}/docsets/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        factory_id,
        name,
        metadata: {
          user_id,
          description: description || '',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Docset creation failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to create docset: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const docsetId = data.docset_id;

    // Store in local cache
    docsets.set(docsetId, {
      id: docsetId,
      status: 'created',
      name,
      description,
      factory_id,
      user_id,
      documents: [],
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      docset_id: docsetId,
      name,
      status: 'created',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating docset:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all docsets from local cache
    const allDocsets = Array.from(docsets.values()).map(docset => ({
      docset_id: docset.id,
      name: docset.name,
      description: docset.description,
      status: docset.status,
      document_count: docset.documents.length,
      created_at: docset.createdAt,
    }));

    return NextResponse.json({
      docsets: allDocsets,
      count: allDocsets.length,
    });
  } catch (error) {
    console.error('Error fetching docsets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch docsets' },
      { status: 500 }
    );
  }
}

