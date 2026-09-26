'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, FileText, CheckCircle2, XCircle, ExternalLink, X, ShieldCheck, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/store/useUIStore';

interface KYCDocProps {
  id: string;
  documentType: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  notes?: string | null;
  submittedAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

export function KYCApprovalButtons({ doc }: { doc: KYCDocProps }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId: doc.id, status }),
      });

      if (!res.ok) throw new Error('Failed to update KYC status');

      addToast({
        type: 'success',
        title: 'KYC Status Updated!',
        message: `Verification document status updated to ${status}.`,
      });

      setIsPreviewOpen(false);
      router.refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const isPdfFile = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.pdf') || lower.includes('.pdf?') || lower.includes('application/pdf');
  };

  const isImageFile = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.startsWith('data:image') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp') || url.includes('images.unsplash.com');
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsPreviewOpen(true)}
          className="font-medium text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Eye className="w-3.5 h-3.5 mr-1 text-slate-600 dark:text-slate-400" /> Preview Document
        </Button>

        {doc.status !== 'APPROVED' && (
          <Button size="sm" onClick={() => updateStatus('APPROVED')} isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs">
            Approve
          </Button>
        )}
        {doc.status !== 'REJECTED' && (
          <Button size="sm" variant="danger" onClick={() => updateStatus('REJECTED')} isLoading={isLoading} className="text-xs">
            Reject
          </Button>
        )}
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">KYC Verification Document Preview</h2>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* User Metadata */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  {doc.user.avatar ? (
                    <img src={doc.user.avatar} alt={doc.user.name || 'User'} className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.user.name || 'Anonymous User'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.user.email} • Role: {doc.user.role}</p>
                  </div>
                </div>
                <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'}>
                  {doc.status}
                </Badge>
              </div>

              {/* Document Overview */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Document Type</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-500" /> {doc.documentType}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Submitted On</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" /> {new Date(doc.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Document File Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Uploaded Verification Artifact
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                  >
                    Open in New Tab <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 p-2 flex items-center justify-center min-h-[220px]">
                  {isPdfFile(doc.fileUrl) ? (
                    <object data={doc.fileUrl} type="application/pdf" className="w-full h-80 rounded-lg bg-white">
                      <iframe src={doc.fileUrl} className="w-full h-80 rounded-lg border-0" title="PDF Preview">
                        <p className="text-xs text-slate-400 p-4 text-center">
                          PDF viewer not supported directly in browser. <a href={doc.fileUrl} target="_blank" className="underline text-brand-400">Click to open PDF</a>.
                        </p>
                      </iframe>
                    </object>
                  ) : !imageError && (isImageFile(doc.fileUrl) || doc.fileUrl.startsWith('http') || doc.fileUrl.startsWith('/')) ? (
                    <img
                      src={doc.fileUrl}
                      alt="Verification Document Preview"
                      onError={() => setImageError(true)}
                      className="max-h-80 w-auto object-contain rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-white">Document reference ready</p>
                        <p className="text-xs text-slate-400 mt-1">{doc.fileUrl}</p>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors"
                      >
                        View Full Document <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsPreviewOpen(false)}
                className="font-semibold text-xs border border-slate-300 dark:border-slate-700"
              >
                Close Preview
              </Button>
              {doc.status !== 'REJECTED' && (
                <Button
                  variant="danger"
                  onClick={() => updateStatus('REJECTED')}
                  isLoading={isLoading}
                  className="font-semibold text-xs"
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Reject Verification
                </Button>
              )}
              {doc.status !== 'APPROVED' && (
                <Button
                  onClick={() => updateStatus('APPROVED')}
                  isLoading={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Verification
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

