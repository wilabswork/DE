import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const list = await db.comparisonList.findUnique({
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

    if (!list) {
      return NextResponse.json({ error: 'Comparison list not found' }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error(`GET /api/comparisons/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const existing = await db.comparisonList.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comparison list not found' }, { status: 404 });
    }

    await db.comparisonList.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, deleted: params.id });
  } catch (error) {
    console.error(`DELETE /api/comparisons/${params.id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete comparison' }, { status: 500 });
  }
}
