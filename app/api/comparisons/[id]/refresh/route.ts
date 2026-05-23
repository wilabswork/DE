import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapeAll } from '@/lib/scrapers';

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    // Verify the list exists
    const list = await db.comparisonList.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'Comparison list not found' }, { status: 404 });
    }

    // Re-scrape all items in parallel
    const refreshPromises = list.items.map(async (item) => {
      try {
        // Scrape new results
        const results = await scrapeAll(item.searchQuery);

        // Delete old results for this item
        await db.searchResult.deleteMany({
          where: { comparisonItemId: item.id },
        });

        // Insert new results
        if (results.length > 0) {
          await db.searchResult.createMany({
            data: results.map((r) => ({
              comparisonItemId: item.id,
              platform: r.platform,
              title: r.title,
              price: r.price,
              currency: r.currency,
              imageUrl: r.imageUrl || null,
              productUrl: r.productUrl,
              specs: r.specs ? JSON.stringify(r.specs) : null,
              rating: r.rating || null,
              reviewCount: r.reviewCount || null,
              seller: r.seller || null,
              inStock: r.inStock,
            })),
          });
        }

        // Update item's updatedAt timestamp
        await db.comparisonItem.update({
          where: { id: item.id },
          data: { updatedAt: new Date() },
        });

        return { itemId: item.id, count: results.length };
      } catch (err) {
        console.error(`Refresh error for item ${item.id}:`, err);
        return { itemId: item.id, count: 0, error: String(err) };
      }
    });

    const refreshResults = await Promise.allSettled(refreshPromises);

    // Update list updatedAt
    await db.comparisonList.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    // Fetch and return the updated list
    const updatedList = await db.comparisonList.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            results: {
              orderBy: { price: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const summary = refreshResults.map((r) =>
      r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' }
    );

    return NextResponse.json({
      success: true,
      summary,
      list: updatedList,
    });
  } catch (error) {
    console.error(`POST /api/comparisons/${params.id}/refresh error:`, error);
    return NextResponse.json({ error: 'Failed to refresh comparison' }, { status: 500 });
  }
}
