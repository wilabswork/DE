'use client';

import { ExternalLink, Star, Package, TrendingDown } from 'lucide-react';

interface SearchResult {
  id: string;
  platform: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  productUrl: string;
  specs: string | null;
  rating: number | null;
  reviewCount: number | null;
  seller: string | null;
  inStock: boolean;
  scrapedAt: Date;
}

interface ComparisonItem {
  id: string;
  productName: string;
  searchQuery: string;
  category: string | null;
  results: SearchResult[];
}

interface Props {
  item: ComparisonItem;
  index: number;
}

const PLATFORMS = [
  {
    key: 'shopee',
    label: 'Shopee',
    color: '#EE4D2D',
    bg: '#FEE8E3',
    headerBg: 'bg-[#EE4D2D]',
    badgeBg: 'bg-[#FEE8E3]',
    badgeText: 'text-[#EE4D2D]',
    borderColor: 'border-[#EE4D2D]/20',
    buttonBg: 'bg-[#EE4D2D] hover:bg-[#d63d1f]',
  },
  {
    key: 'lazada',
    label: 'Lazada',
    color: '#0F146D',
    bg: '#E8E9F7',
    headerBg: 'bg-[#0F146D]',
    badgeBg: 'bg-[#E8E9F7]',
    badgeText: 'text-[#0F146D]',
    borderColor: 'border-[#0F146D]/20',
    buttonBg: 'bg-[#0F146D] hover:bg-[#0a0f55]',
  },
  {
    key: 'amazon',
    label: 'Amazon',
    color: '#E65100',
    bg: '#FFF3E0',
    headerBg: 'bg-[#232F3E]',
    badgeBg: 'bg-[#FFF3E0]',
    badgeText: 'text-[#E65100]',
    borderColor: 'border-[#FF9900]/20',
    buttonBg: 'bg-[#FF9900] hover:bg-[#e68a00]',
  },
];

function formatPrice(price: number, currency: string): string {
  return `${currency} ${price.toFixed(2)}`;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className="w-3 h-3 text-amber-400 fill-amber-400" />
      ))}
      {hasHalf && <Star className="w-3 h-3 text-amber-400 fill-amber-200" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="w-3 h-3 text-slate-300 fill-slate-100" />
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function PlatformCard({
  result,
  isLowest,
  platform,
}: {
  result: SearchResult;
  isLowest: boolean;
  platform: (typeof PLATFORMS)[0];
}) {
  return (
    <div
      className={`bg-white rounded-xl border ${
        isLowest ? 'border-green-300 ring-1 ring-green-200' : 'border-slate-200'
      } overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col`}
    >
      {isLowest && (
        <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          LOWEST PRICE
        </div>
      )}

      {/* Image */}
      <div className="relative bg-slate-50 h-40 flex items-center justify-center overflow-hidden">
        {result.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={result.imageUrl}
            alt={result.title}
            className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="flex flex-col items-center gap-1 text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-xs">No image</span></div>`;
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-300">
            <Package className="w-8 h-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
        {!result.inStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-slate-700 leading-snug line-clamp-3 mb-2 flex-1">
          {result.title}
        </p>

        {/* Price */}
        <div className="mb-2">
          <span
            className={`text-xl font-bold ${
              isLowest ? 'text-green-600' : 'text-slate-900'
            }`}
          >
            {formatPrice(result.price, result.currency)}
          </span>
        </div>

        {/* Rating */}
        {result.rating !== null && (
          <div className="mb-2">
            <StarRating rating={result.rating} />
            {result.reviewCount !== null && (
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {result.reviewCount.toLocaleString()} reviews
              </span>
            )}
          </div>
        )}

        {/* Seller */}
        {result.seller && (
          <p className="text-[10px] text-slate-500 truncate mb-2">
            Sold by: <span className="font-medium">{result.seller}</span>
          </p>
        )}

        {/* CTA */}
        <a
          href={result.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto flex items-center justify-center gap-1.5 ${platform.buttonBg} text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors`}
        >
          <ExternalLink className="w-3 h-3" />
          View on {platform.label}
        </a>
      </div>
    </div>
  );
}

function EmptyPlatform({ platform }: { platform: (typeof PLATFORMS)[0] }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: platform.bg }}
      >
        <Package className="w-4 h-4" style={{ color: platform.color }} />
      </div>
      <p className="text-xs font-medium">No results on {platform.label}</p>
    </div>
  );
}

export default function ProductResultsSection({ item, index }: Props) {
  // Find lowest price across all results
  const prices = item.results
    .filter((r) => r.inStock && r.price > 0)
    .map((r) => r.price);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      {/* Product Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{item.productName}</h3>
            <p className="text-xs text-slate-500 font-mono">{item.searchQuery}</p>
          </div>
        </div>
        {lowestPrice !== null && (
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Best price</p>
            <p className="text-lg font-bold text-green-600">
              SGD {lowestPrice.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Platform Columns */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {PLATFORMS.map((platform) => {
            const platformResults = item.results
              .filter((r) => r.platform.toLowerCase() === platform.key)
              .slice(0, 3);

            return (
              <div key={platform.key}>
                {/* Platform Header */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-t-xl ${platform.headerBg} mb-2`}
                >
                  <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                  <span className="text-white text-xs font-bold tracking-wide">
                    {platform.label.toUpperCase()}
                  </span>
                  {platformResults.length > 0 && (
                    <span className="ml-auto text-white/70 text-[10px] font-medium">
                      {platformResults.length} result{platformResults.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Results */}
                {platformResults.length === 0 ? (
                  <EmptyPlatform platform={platform} />
                ) : (
                  <div className="space-y-3">
                    {platformResults.map((result) => (
                      <PlatformCard
                        key={result.id}
                        result={result}
                        platform={platform}
                        isLowest={
                          lowestPrice !== null &&
                          result.price === lowestPrice &&
                          result.inStock
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
