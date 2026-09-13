'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';

export function UserActionButton({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      addToast({
        type: 'success',
        title: 'User Status Updated!',
        message: `Account status set to ${newStatus}.`,
      });

      router.refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={currentStatus === 'ACTIVE' ? 'danger' : 'outline'}
      onClick={toggleStatus}
      isLoading={isLoading}
      className="text-xs py-1 px-2.5"
    >
      {currentStatus === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
    </Button>
  );
}
