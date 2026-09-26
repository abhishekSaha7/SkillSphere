'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, KeyRound, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetUrl?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset.');
      }

      setSuccessInfo({
        message: data.message,
        resetUrl: data.resetUrl,
      });
      toast.success('Password reset request processed!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      toast.error(err.message || 'Request failed.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-white">Reset Your Password</CardTitle>
          <p className="text-xs text-slate-300 mt-1">Enter your email to receive password reset instructions</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Reset Request Processed</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">{successInfo.message}</p>
              </div>

              {successInfo.resetUrl && (
                <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-900 space-y-2">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    Demo Environment Password Link
                  </p>
                  <Link href={successInfo.resetUrl}>
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold">
                      Proceed to Reset Password &rarr;
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" className="w-full py-2.5 font-semibold" isLoading={isLoading}>
                Request Reset Token
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            Remembered your credentials?{' '}
            <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
