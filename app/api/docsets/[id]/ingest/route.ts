import { NextRequest, NextResponse } from 'next/server';
import { ingestLimiter } from '@/app/lib/concurrency-limiter';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const factory_id = formData.get('factory_id') as string || 'default';
    const user_id = formData.get('user_id') as string || 'anonymous';
    const doc_tags = formData.get('doc_tags') as string || '';
    const top_k = formData.get('top_k') as string || '8';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Process document with concurrency limiting
    // If at capacity, the request will be queued automatically
    const result = await ingestLimiter.run(async () => {
      return await processDocumentIngestion(id, file, user_id, source_type, factory_id, doc_tags, top_k);
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error ingesting document:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

async function processDocumentIngestion(
  id: string,
  file: File,
  user_id: string,
  source_type: string,
  factory_id: string,
  doc_tags: string,
  top_k: string
) {
  const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;
  
  // Prepare form data for upstream API using /vpstudio/transform endpoint
  const upstreamFormData = new FormData();
  upstreamFormData.append('files', file);
  
  // Prepare data field
  const dataField = {
    docset_id: id,
    text: {
      content_prompt: 'What is this document about?'
    },
    documents: [{
      source: 'upload',
      file_index: 0
    }]
  };
  upstreamFormData.append('data', JSON.stringify(dataField));
  
  // Prepare factory_settings
  const factorySettings = {
    top_k: parseInt(top_k, 10)
  };
  upstreamFormData.append('factory_settings', JSON.stringify(factorySettings));
  
  // Prepare metadata
  const metadata = {
    user_id
  };
  upstreamFormData.append('metadata', JSON.stringify(metadata));

  const response = await fetch(`${API_BASE_URL}/vpstudio/transform`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'X-Factory-Id': factory_id,
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
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('Ingest response:', JSON.stringify(data, null, 2));
  
  const jobId = data.id || data.job_id;
  const docId = data.doc_id || jobId;

  // Map upstream status
  const upstreamStatus = data.status;
  let docsetStatus: 'created' | 'ingesting' | 'ready' | 'failed' = 'ingesting';
  if (upstreamStatus === 'completed') {
    docsetStatus = 'ready';
  } else if (upstreamStatus === 'failed' || data.error) {
    docsetStatus = 'failed';
  } else if (upstreamStatus === 'queued' || upstreamStatus === 'ingesting' || upstreamStatus === 'generating') {
    docsetStatus = 'ingesting';
  }

  // Return document info for client to store
  return {
    job_id: jobId,
    doc_id: docId,
    docset_id: id,
    status: data.status || 'processing',
    docset_status: docsetStatus,
    source_type,
    doc_tags: doc_tags ? doc_tags.split(',').map(t => t.trim()) : [],
    chunks: data.chunks,
    vectors: data.vectors,
    processing_time_ms: data.processing_time_ms,
    message: data.message,
    uploaded_at: new Date().toISOString(),
    ...data,
  };
}

