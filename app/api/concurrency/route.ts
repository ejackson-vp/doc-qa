import { NextResponse } from 'next/server';
import { ingestLimiter, generateLimiter } from '@/app/lib/concurrency-limiter';

/**
 * GET /api/concurrency
 * Returns current concurrency limiter statistics for both ingestion and generation
 */
export async function GET() {
  try {
    const ingestStats = ingestLimiter.getStats();
    const generateStats = generateLimiter.getStats();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ingestion: {
        name: ingestStats.name,
        maxConcurrent: ingestStats.maxConcurrent,
        activeCount: ingestStats.activeCount,
        queuedCount: ingestStats.queuedCount,
        availableSlots: ingestStats.availableSlots,
        utilizationPercent: Math.round((ingestStats.activeCount / ingestStats.maxConcurrent) * 100)
      },
      generation: {
        name: generateStats.name,
        maxConcurrent: generateStats.maxConcurrent,
        activeCount: generateStats.activeCount,
        queuedCount: generateStats.queuedCount,
        availableSlots: generateStats.availableSlots,
        utilizationPercent: Math.round((generateStats.activeCount / generateStats.maxConcurrent) * 100)
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching concurrency stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch concurrency statistics' },
      { status: 500 }
    );
  }
}

