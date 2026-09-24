'use client';

import React, { useState, Suspense } from 'react';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectUserByRole = (userRole: string) => {
    if (callbackUrl && callbackUrl !== '/' && !callbackUrl.includes('/login')) {
      router.push(callbackUrl);
      return;
    }

    if (userRole === 'STUDENT') router.push('/student/dashboard');
    else if (userRole === 'INSTRUCTOR') router.push('/instructor/dashboard');
    else if (userRole === 'MENTOR') router.push('/mentor/dashboard');
    else if (userRole === 'ORGANIZATION') router.push('/organization/dashboard');
    else if (userRole === 'SUPER_ADMIN') router.push('/admin/dashboard');
    else router.push('/student/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role) {
      const msg = 'Please select a role to sign in.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!email.trim() || !password) {
      const msg = 'Email address and password are required.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      const actualRole = session?.user?.role;

      if (!actualRole) {
        setError('Authentication failed. Session invalid.');
        toast.error('Authentication failed.');
        setIsLoading(false);
        return;
      }

      // Verify that the account's actual role matches the selected role in the dropdown
      // (Note: SUPER_ADMIN users can access any role portal)
      if (actualRole !== 'SUPER_ADMIN' && actualRole !== role) {
        await signOut({ redirect: false });
        const mismatchError = `Role mismatch: This account is registered as ${actualRole}, not ${role}. Please select ${actualRole} to log in.`;
        setError(mismatchError);
        toast.error(`Access denied: Registered as ${actualRole}`);
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back! Signed in as ${actualRole.replace('_', ' ')}.`);
      redirectUserByRole(actualRole);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError(null);
            }}
            required
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          >
            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500">
              -- Select Intended Role --
            </option>
            <option value="STUDENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Customer / Learner (Student)
            </option>
            <option value="INSTRUCTOR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Instructor / Course Author
            </option>
            <option value="MENTOR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              1-on-1 Tech Mentor
            </option>
            <option value="ORGANIZATION" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Training Organization
            </option>
            <option value="SUPER_ADMIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              Super Admin
            </option>
          </select>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full py-2.5 font-semibold" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
          Create an account
        </Link>
      </div>
    </CardContent>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-xl">
        <CardHeader className="text-center bg-slate-900 dark:bg-slate-950 text-white py-8 rounded-t-xl">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-brand-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to SkillSphere</CardTitle>
          <p className="text-xs text-slate-300 mt-1">Sign in to access your portal</p>
        </CardHeader>

        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading form...</div>}>
          <LoginFormContent />
        </Suspense>
      </Card>
    </div>
  );
}

