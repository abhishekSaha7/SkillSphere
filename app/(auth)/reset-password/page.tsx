'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setIsSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Reset password failed.');
      toast.error(err.message || 'Reset password failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <CardContent className="p-6 text-center space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300">
          Invalid reset link. No token provided in URL.
        </div>
        <Link href="/forgot-password">
          <Button size="sm">Request New Link</Button>
        </Link>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-4 p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Password Updated!</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Your password has been changed successfully. Redirecting to login page...
          </p>
          <Link href="/login">
            <Button size="sm" className="bg-brand-600 hover:bg-brand-700 font-semibold">
              Go to Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full py-2.5 font-semibold" isLoading={isLoading}>
            Set New Password
          </Button>
        </form>
      )}
    </CardContent>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <Link href="/login" className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>

      <Card className="border-slate-200/90 dark:border-slate-800 shadow-xl">
        <CardHeader className="text-center bg-slate-900 dark:bg-slate-950 text-white py-8 rounded-t-xl">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-brand-500/30">
            <KeyRound className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Choose New Password</CardTitle>
          <p className="text-xs text-slate-300 mt-1">Set a strong password for your SkillSphere account</p>
        </CardHeader>

        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading form...</div>}>
          <ResetPasswordFormContent />
        </Suspense>
      </Card>
    </div>
  );
}
