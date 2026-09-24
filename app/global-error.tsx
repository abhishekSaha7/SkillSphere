'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 antialiased text-slate-900 dark:text-white">
        <div className="max-w-md w-full p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            ⚠️
          </div>
          <h2 className="text-xl font-bold">System Error</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.message || 'A critical application error occurred.'}
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
