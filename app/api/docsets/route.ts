import { NextRequest, NextResponse } from 'next/server';
import { docsets } from '@/app/lib/docsets-store';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // Check if request is JSON (legacy) or form data (new API)
    if (contentType.includes('application/json')) {
      // Legacy JSON endpoint - return error asking for form data
      return NextResponse.json(
        { error: 'This endpoint now requires multipart/form-data with a file. Please send form data instead of JSON.' },
        { status: 400 }
      );
    }

    // New API: expect form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const description = formData.get('description') as string | null;
    const factory_id = formData.get('factory_id') as string || 'default';
    const user_id = formData.get('user_id') as string || 'anonymous';
    const top_k = formData.get('top_k') as string || '8';

    // Validate input
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare form data for upstream API
    const upstreamFormData = new FormData();
    upstreamFormData.append('files', file);
    
    // Prepare data field
    const dataField = {
      text: {
        content_prompt: description || 'What is this document about?'
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

    // Call upstream API using /vpstudio/transform endpoint
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
      console.error('Docset creation failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to create docset: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Upstream API response:', JSON.stringify(data, null, 2));
    
    // Extract job ID from response (it's in 'id' field)
    const jobId = data.id || data.job_id;
    
    if (!jobId) {
      console.error('Failed to extract job ID from response:', data);
      return NextResponse.json(
        { error: 'Failed to get job ID from upstream API' },
        { status: 500 }
      );
    }
    
    // Extract docset_id - should be in input.docset_id or execution.docset_id
    // If null, we need to poll briefly to get it
    let docsetId = data.input?.docset_id || data.execution?.docset_id || data.docset_id;
    
    // If docset_id is not available yet, poll a few times (it usually becomes available quickly)
    if (!docsetId) {
      console.log('docset_id not available yet, polling for it...');
      const maxQuickPolls = 10; // Poll for up to 20 seconds
      const pollInterval = 2000; // 2 seconds
      
      for (let attempt = 0; attempt < maxQuickPolls; attempt++) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        try {
          const statusUrl = new URL(`${API_BASE_URL}/vpstudio/transform/${jobId}`);
          statusUrl.searchParams.set('user_id', user_id);
          
          const statusResponse = await fetch(statusUrl.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${BEARER_TOKEN}`,
              'X-Factory-Id': factory_id,
            },
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            docsetId = statusData.input?.docset_id || statusData.execution?.docset_id || statusData.docset_id;
            
            console.log(`Poll attempt ${attempt + 1}/${maxQuickPolls}: docset_id=${docsetId}`);
            
            if (docsetId) {
              console.log('Got docset_id:', docsetId);
              break;
            }
          }
        } catch (pollError) {
          console.error(`Poll attempt ${attempt + 1} failed:`, pollError);
        }
      }
    }
    
    // If still no docset_id, use job_id as identifier
    if (!docsetId) {
      console.warn('Could not get docset_id after polling, using job_id as identifier');
      docsetId = jobId;
    }
    
    // Map upstream status to our status
    const upstreamStatus = data.status;
    let docsetStatus: 'created' | 'ingesting' | 'ready' | 'failed' = 'ingesting';
    
    if (upstreamStatus === 'completed') {
      docsetStatus = 'ready';
    } else if (upstreamStatus === 'failed' || data.error) {
      docsetStatus = 'failed';
    } else if (upstreamStatus === 'queued' || upstreamStatus === 'ingesting' || upstreamStatus === 'generating') {
      docsetStatus = 'ingesting';
    }
    
    console.log('Extracted: docset_id:', docsetId, 'job_id:', jobId, 'status:', docsetStatus);

    // Store in local cache
    docsets.set(docsetId, {
      id: docsetId,
      status: docsetStatus,
      name: name || file.name,
      description: description || '',
      factory_id,
      user_id,
      documents: [],
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      docset_id: docsetId,
      job_id: jobId,
      name: name || file.name,
      status: docsetStatus,
      ...data, // Include any additional fields from upstream API
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

