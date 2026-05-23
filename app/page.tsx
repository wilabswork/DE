import Link from 'next/link';
import { Compass, PlusCircle, BarChart3 } from 'lucide-react';
import { db } from '@/lib/db';
import ComparisonListCard from '@/components/ComparisonListCard';

async function getComparisonLists() {
  try {
    const lists = await db.comparisonList.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        items: {
          include: {
            results: {
              orderBy: { scrapedAt: 'desc' },
            },
          },
        },
      },
    });
    return lists;
  } catch (error) {
    console.error('Failed to fetch comparison lists:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const lists = await getComparisonLists();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Price Comparisons</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track and compare prices across Singapore&apos;s top platforms
            </p>
          </div>
          <Link
            href="/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-indigo-200 hover:shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            New Comparison
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {lists.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <Compass className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              No comparisons yet
            </h2>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
              Start tracking product prices across Shopee, Lazada, and Amazon SG.
              Our AI wizard helps you find exactly what you&apos;re looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/new"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-indigo-200 hover:shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                Create Your First List
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-12 justify-center">
              {[
                { color: 'bg-[#EE4D2D]', label: 'Shopee SG' },
                { color: 'bg-[#0F146D]', label: 'Lazada SG' },
                { color: 'bg-[#FF9900]', label: 'Amazon SG' },
              ].map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-sm px-3 py-1.5 rounded-full font-medium shadow-sm"
                >
                  <span className={`w-2 h-2 rounded-full ${p.color}`} />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{lists.length}</p>
                    <p className="text-xs text-slate-500 font-medium">Comparison Lists</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lists.reduce((sum, l) => sum + l.items.length, 0)}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Products Tracked</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {lists.reduce(
                        (sum, l) =>
                          sum + l.items.reduce((s, i) => s + i.results.length, 0),
                        0
                      )}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Price Points Collected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {lists.map((list) => (
                <ComparisonListCard key={list.id} list={list} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
