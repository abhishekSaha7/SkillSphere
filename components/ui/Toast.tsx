'use client';

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 animate-slide-up"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
          <div className="flex-1">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            {toast.message && <p className="text-xs text-slate-300 mt-1">{toast.message}</p>}
          </div>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
