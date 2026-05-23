import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ArrowLeft, Clock, Package } from 'lucide-react';
import ProductResultsSection from '@/components/ProductResultsSection';
import CompareActions from '@/components/CompareActions';

interface PageProps {
  params: { id: string };
}

async function getComparisonList(id: string) {
  try {
    const list = await db.comparisonList.findUnique({
      where: { id },
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
    return list;
  } catch (error) {
    console.error('Failed to fetch comparison:', error);
    return null;
  }
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default async function ComparePage({ params }: PageProps) {
  const list = await getComparisonList(params.id);

  if (!list) {
    notFound();
  }

  // Get last refresh time
  let lastRefreshed: Date | null = null;
  for (const item of list.items) {
    for (const result of item.results) {
      const d = new Date(result.scrapedAt);
      if (!lastRefreshed || d > lastRefreshed) {
        lastRefreshed = d;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="w-px h-5 bg-slate-200" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{list.name}</h1>
                {list.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{list.description}</p>
                )}
              </div>
            </div>
            <CompareActions listId={list.id} />
          </div>

          {/* Meta bar */}
          <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>
                <span className="font-semibold text-slate-700">{list.items.length}</span>{' '}
                {list.items.length === 1 ? 'product' : 'products'} tracked
              </span>
            </div>
            {lastRefreshed ? (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last refreshed {timeAgo(lastRefreshed)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Never refreshed</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {[
                { label: 'Shopee', color: '#EE4D2D', bg: '#FEE8E3' },
                { label: 'Lazada', color: '#0F146D', bg: '#E8E9F7' },
                { label: 'Amazon', color: '#FF9900', bg: '#FFF3E0' },
              ].map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px]"
                  style={{ backgroundColor: p.bg, color: p.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {list.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">No products in this list</h2>
            <p className="text-slate-500 text-sm">This comparison list has no products yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {list.items.map((item, index) => (
              <ProductResultsSection
                key={item.id}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
