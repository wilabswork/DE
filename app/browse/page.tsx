'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink, Star, AlertCircle } from 'lucide-react';

interface ScrapedResult {
  platform: string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  productUrl: string;
  rating?: number;
  reviewCount?: number;
  seller?: string;
  inStock: boolean;
}

const PLATFORM_STYLES: Record<
  string,
  { label: string; color: string; bg: string; button: string }
> = {
  shopee: {
    label: 'Shopee',
    color: '#EE4D2D',
    bg: '#FEE8E3',
    button: 'bg-[#EE4D2D] hover:bg-[#d63d1f]',
  },
  lazada: {
    label: 'Lazada',
    color: '#0F146D',
    bg: '#E8E9F7',
    button: 'bg-[#0F146D] hover:bg-[#0a0f55]',
  },
  amazon: {
    label: 'Amazon',
    color: '#E65100',
    bg: '#FFF3E0',
    button: 'bg-[#FF9900] hover:bg-[#e68a00]',
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-100'
          }`}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScrapedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);

    const q = query.trim();
    setSearchedQuery(q);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResults(data.results || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Group by platform
  const grouped = results.reduce<Record<string, ScrapedResult[]>>((acc, r) => {
    const p = r.platform.toLowerCase();
    if (!acc[p]) acc[p] = [];
    acc[p].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Browse Prices</h1>
          <p className="text-sm text-slate-500">
            Search any product and instantly compare prices across all platforms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for any product... e.g. iPhone 16 Pro"
                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-6">
            {['shopee', 'lazada', 'amazon'].map((p) => (
              <div key={p} className="space-y-3">
                <div className="shimmer h-10 rounded-xl" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="shimmer h-36" />
                    <div className="p-3 space-y-2">
                      <div className="shimmer h-4 rounded w-full" />
                      <div className="shimmer h-4 rounded w-3/4" />
                      <div className="shimmer h-6 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && !isLoading && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Results for &ldquo;{searchedQuery}&rdquo;
              </h2>
              <span className="text-sm text-slate-500">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Try different keywords or check your spelling. The platforms may have blocked our
                  request temporarily.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {['shopee', 'lazada', 'amazon'].map((platform) => {
                  const platformResults = grouped[platform] || [];
                  const style = PLATFORM_STYLES[platform];

                  return (
                    <div key={platform}>
                      {/* Platform Header */}
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-3 text-white font-bold text-sm"
                        style={{
                          backgroundColor:
                            platform === 'amazon' ? '#232F3E' : style.color,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              platform === 'amazon' ? '#FF9900' : 'white',
                          }}
                        />
                        {style.label}
                        <span className="ml-auto text-white/70 text-xs font-medium">
                          {platformResults.length} results
                        </span>
                      </div>

                      {platformResults.length === 0 ? (
                        <div
                          className="h-40 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400"
                          style={{ backgroundColor: style.bg }}
                        >
                          <Search className="w-6 h-6" style={{ color: style.color }} />
                          <p className="text-xs font-medium">No results on {style.label}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {platformResults.slice(0, 5).map((result, i) => (
                            <div
                              key={i}
                              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                            >
                              {result.imageUrl && (
                                <div className="h-36 bg-slate-50 overflow-hidden flex items-center justify-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={result.imageUrl}
                                    alt={result.title}
                                    className="w-full h-full object-contain p-2"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="p-3">
                                <p className="text-xs text-slate-700 line-clamp-2 mb-2 leading-snug">
                                  {result.title}
                                </p>
                                <p className="text-lg font-bold text-slate-900 mb-1">
                                  {result.currency} {result.price.toFixed(2)}
                                </p>
                                {result.rating && (
                                  <div className="mb-2">
                                    <StarRating rating={result.rating} />
                                    {result.reviewCount && (
                                      <span className="text-[10px] text-slate-400">
                                        {result.reviewCount.toLocaleString()} reviews
                                      </span>
                                    )}
                                  </div>
                                )}
                                {!result.inStock && (
                                  <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                                    Out of Stock
                                  </span>
                                )}
                                <a
                                  href={result.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center justify-center gap-1.5 ${style.button} text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors mt-2`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View on {style.label}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {!searched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Search for products</h2>
            <p className="text-slate-500 text-sm max-w-md mb-8 leading-relaxed">
              Type any product name above to instantly compare prices across Shopee, Lazada, and Amazon SG.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'iPhone 16 Pro',
                'Samsung Galaxy S25',
                'MacBook Air M3',
                'Sony WH-1000XM5',
                'Samsung 65" QLED TV',
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    setTimeout(() => handleSearch(), 50);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-full text-sm font-medium transition-all duration-150 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
