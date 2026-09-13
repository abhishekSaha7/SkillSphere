'use client';

import React, { useState } from 'react';
import { ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store/useUIStore';

export default function InstructorProfilePage() {
  const { addToast } = useUIStore();
  const [documentType, setDocumentType] = useState('University Degree');
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Verification Submitted!',
        message: 'Your document has been submitted for Super Admin review.',
      });
      setFileUrl('');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Instructor Profile & KYC Verification</h1>
        <p className="text-xs text-slate-500 mt-1">Submit official qualifications and identity credentials for platform approval.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" /> Submit Identity / Qualification Document
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleKYCSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="University Degree">University Degree</option>
                <option value="Professional License / Certification">Professional License / Certification</option>
                <option value="Government Passport / ID Card">Government Passport / ID Card</option>
              </select>
            </div>

            <Input
              label="Document Reference / Cloud Link"
              placeholder="e.g. /mock-docs/sarah-degree.pdf"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="font-semibold">
                <Upload className="w-4 h-4 mr-1.5" /> Submit Document for Review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
