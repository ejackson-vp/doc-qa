import { NextResponse } from 'next/server';
import { ingestLimiter, generateLimiter } from '@/app/lib/concurrency-limiter';

export async function GET() {
  const ingestStats = ingestLimiter.getStats();
  const generateStats = generateLimiter.getStats();
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stateless: true,
    concurrency: {
      ingestion: {
        active: ingestStats.activeCount,
        queued: ingestStats.queuedCount,
        max: ingestStats.maxConcurrent
      },
      generation: {
        active: generateStats.activeCount,
        queued: generateStats.queuedCount,
        max: generateStats.maxConcurrent
      }
    }
  });
}

