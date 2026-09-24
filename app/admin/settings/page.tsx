'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store/useUIStore';

export default function AdminSettingsPage() {
  const { addToast } = useUIStore();
  const [siteName, setSiteName] = useState('SkillSphere');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState('MOCK');
  const [storageProvider, setStorageProvider] = useState('MOCK');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Platform Configuration Saved!',
      message: 'System environment options updated successfully.',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings & Integrations</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure service provider abstractions and system maintenance flags.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Application Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Active Payment Provider Abstraction
              </label>
              <select
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                <option value="MOCK" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MOCK (Zero credentials required for local dev)</option>
                <option value="STRIPE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Stripe (Configurable via STRIPE_SECRET_KEY env)</option>
                <option value="RAZORPAY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Razorpay (Configurable via RAZORPAY_KEY env)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Active Storage Provider Abstraction
              </label>
              <select
                value={storageProvider}
                onChange={(e) => setStorageProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              >
                <option value="MOCK" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">MOCK (Local disk/base64 uploads)</option>
                <option value="S3" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">AWS S3 (Configurable via AWS_S3_BUCKET env)</option>
                <option value="CLOUDINARY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cloudinary (Configurable via CLOUDINARY_URL env)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" className="font-semibold">
                <Save className="w-4 h-4 mr-1.5" /> Save Configuration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
