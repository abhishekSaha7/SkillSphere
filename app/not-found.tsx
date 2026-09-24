import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-0">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-600 dark:text-slate-300">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Page Not Found (404)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requested route or resource could not be found.
          </p>
          <div className="pt-2 flex justify-center">
            <Link href="/">
              <Button size="sm">
                <Home className="w-4 h-4 mr-1.5" /> Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
