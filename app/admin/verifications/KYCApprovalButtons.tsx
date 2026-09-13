'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';

export function KYCApprovalButtons({ kycId, currentStatus }: { kycId: string; currentStatus: string }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, status }),
      });

      if (!res.ok) throw new Error('Failed to update KYC status');

      addToast({
        type: 'success',
        title: 'KYC Status Updated!',
        message: `Document status updated to ${status}.`,
      });

      router.refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== 'APPROVED' && (
        <Button size="sm" onClick={() => updateStatus('APPROVED')} isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
          Approve Verification
        </Button>
      )}
      {currentStatus !== 'REJECTED' && (
        <Button size="sm" variant="danger" onClick={() => updateStatus('REJECTED')} isLoading={isLoading}>
          Reject
        </Button>
      )}
    </div>
  );
}
