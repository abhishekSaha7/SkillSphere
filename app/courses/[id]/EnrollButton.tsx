'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';

export function EnrollButton({ courseId, price }: { courseId: string; price: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/courses/${courseId}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Enrollment failed');

      addToast({
        type: 'success',
        title: 'Successfully Enrolled!',
        message: 'Redirecting to your course workspace...',
      });

      setTimeout(() => {
        router.push(`/student/courses/${courseId}`);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Enrollment Error',
        message: err.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} isLoading={isLoading} className="w-full py-3 font-bold shadow-md">
      {price === 0 ? 'Enroll Now (Free)' : `Enroll Now — $${price.toFixed(2)}`}
    </Button>
  );
}
