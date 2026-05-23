import { NextRequest, NextResponse } from 'next/server';
import { scrapeAll } from '@/lib/scrapers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body as { query?: string };

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }

    const results = await scrapeAll(query.trim());

    return NextResponse.json({
      query: query.trim(),
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('POST /api/scrape error:', error);
    return NextResponse.json({ error: 'Failed to scrape results' }, { status: 500 });
  }
}
