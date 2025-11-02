import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Server is stateless - docsets are stored client-side
  // This endpoint exists for backward compatibility
  return NextResponse.json({
    error: 'Not found',
    message: 'Server is stateless. Docsets are managed client-side.',
    docset_id: id
  }, { status: 404 });
}

