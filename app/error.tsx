'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SkillSphere App Error]', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-0">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Something went wrong!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Button onClick={() => reset()} size="sm">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
