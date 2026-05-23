'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ExternalLink, Clock, Package, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  platform: string;
  scrapedAt: Date;
}

interface ComparisonItem {
  id: string;
  results: SearchResult[];
}

interface ComparisonList {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: ComparisonItem[];
}

interface Props {
  list: ComparisonList;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const PLATFORM_CONFIG = {
  shopee: { label: 'Shopee', color: 'bg-[#FEE8E3] text-[#EE4D2D]', dot: 'bg-[#EE4D2D]' },
  lazada: { label: 'Lazada', color: 'bg-[#E8E9F7] text-[#0F146D]', dot: 'bg-[#0F146D]' },
  amazon: { label: 'Amazon', color: 'bg-[#FFF3E0] text-[#E65100]', dot: 'bg-[#FF9900]' },
};

export default function ComparisonListCard({ list }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique platforms across all results
  const platforms = new Set<string>();
  for (const item of list.items) {
    for (const result of item.results) {
      platforms.add(result.platform.toLowerCase());
    }
  }

  // Get the most recent scrape date
  let lastUpdated: Date | null = null;
  for (const item of list.items) {
    for (const result of item.results) {
      const d = new Date(result.scrapedAt);
      if (!lastUpdated || d > lastUpdated) {
        lastUpdated = d;
      }
    }
  }

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      await fetch(`/api/comparisons/${list.id}/refresh`, { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden">
      {/* Top color strip */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-1 group-hover:text-indigo-700 transition-colors">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {list.description}
            </p>
          )}
        </div>

        {/* Platform Badges */}
        {platforms.size > 0 ? (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Array.from(platforms).map((platform) => {
              const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              if (!config) return null;
              return (
                <span
                  key={platform}
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${config.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  {config.label}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['shopee', 'lazada', 'amazon'].map((platform) => {
              const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
              return (
                <span
                  key={platform}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  {config.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <span className="font-semibold text-slate-700">{list.items.length}</span>{' '}
              {list.items.length === 1 ? 'product' : 'products'}
            </span>
          </div>
          {lastUpdated ? (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated {timeAgo(lastUpdated)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Not yet scraped</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/compare/${list.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Refresh prices"
          >
            {isRefreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
