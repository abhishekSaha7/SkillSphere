'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PrintCertificateButton() {
  return (
    <Button
      size="sm"
      onClick={() => window.print()}
      className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs gap-1.5 print:hidden"
    >
      <Printer className="w-4 h-4" /> Download / Print PDF Certificate
    </Button>
  );
}
