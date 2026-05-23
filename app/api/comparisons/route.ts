import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scrapeAll } from '@/lib/scrapers';

export async function GET() {
  try {
    const lists = await db.comparisonList.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            searchQuery: true,
            _count: {
              select: { results: true },
            },
          },
        },
      },
    });
    return NextResponse.json(lists);
  } catch (error) {
    console.error('GET /api/comparisons error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 });
  }
}

interface CreateItemInput {
  productName: string;
  searchQuery: string;
  category?: string;
}

interface CreateListInput {
  name: string;
  description?: string;
  items: CreateItemInput[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateListInput = await request.json();
    const { name, description, items } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Create the comparison list with its items
    const list = await db.comparisonList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        items: {
          create: items.map((item) => ({
            productName: item.productName.trim(),
            searchQuery: item.searchQuery.trim(),
            category: item.category?.trim() || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Scrape all items in parallel (fire and await)
    const scrapePromises = list.items.map(async (item) => {
      try {
        const results = await scrapeAll(item.searchQuery);

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
      } catch (scrapeErr) {
        console.error(`Scrape error for item ${item.id}:`, scrapeErr);
      }
    });

    await Promise.allSettled(scrapePromises);

    // Fetch the complete list with results
    const completeList = await db.comparisonList.findUnique({
      where: { id: list.id },
      include: {
        items: {
          include: { results: true },
        },
      },
    });

    return NextResponse.json(completeList, { status: 201 });
  } catch (error) {
    console.error('POST /api/comparisons error:', error);
    return NextResponse.json({ error: 'Failed to create comparison' }, { status: 500 });
  }
}
