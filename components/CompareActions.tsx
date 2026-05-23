'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Trash2, Loader2 } from 'lucide-react';

interface Props {
  listId: string;
}

export default function CompareActions({ listId }: Props) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`/api/comparisons/${listId}/refresh`, { method: 'POST' });
      router.refresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/comparisons/${listId}`, { method: 'DELETE' });
      router.push('/');
    } catch (err) {
      console.error('Delete failed:', err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing || isDeleting}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isRefreshing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {isRefreshing ? 'Refreshing...' : 'Refresh All'}
      </button>

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isRefreshing || isDeleting}
          className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 font-medium">Confirm delete?</span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Yes, delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
