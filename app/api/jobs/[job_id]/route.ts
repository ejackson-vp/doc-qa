import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DOCSETS_API_URL || 'https://060de239.voltagepark.studio';
const BEARER_TOKEN = process.env.DOCSETS_BEARER_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id } = await params;

    if (!BEARER_TOKEN) {
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }

    // Extract factory_id and user_id from query params
    const searchParams = request.nextUrl.searchParams;
    const factory_id = searchParams.get('factory_id') || 'default';
    const user_id = searchParams.get('user_id') || 'anonymous';

    // Build URL with query parameters
    // Note: job_id already includes "job_" prefix if it came from the API
    const jobPath = job_id.startsWith('job_') ? job_id : `job_${job_id}`;
    const statusUrl = new URL(`${API_BASE_URL}/vpstudio/transform/${jobPath}`);
    statusUrl.searchParams.set('user_id', user_id);

    // Call upstream API to check job status
    const response = await fetch(statusUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'X-Factory-Id': factory_id,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Job status check failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to check job status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      job_id,
      ...data,
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking job status:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

