'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';

export function CourseApprovalButtons({ courseId, currentStatus }: { courseId: string; currentStatus: string }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: 'PUBLISHED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, status }),
      });

      if (!res.ok) throw new Error('Failed to update course status');

      addToast({
        type: 'success',
        title: 'Status Updated!',
        message: `Course set to ${status}. Notification sent to instructor.`,
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
      {currentStatus !== 'PUBLISHED' && (
        <Button size="sm" onClick={() => updateStatus('PUBLISHED')} isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700 font-semibold">
          Approve & Publish
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
