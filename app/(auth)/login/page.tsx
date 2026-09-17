'use client';

import React, { useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Sparkles, User, ShieldCheck, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectUserByRole = (role: string) => {
    if (callbackUrl && callbackUrl !== '/' && !callbackUrl.includes('/login')) {
      router.push(callbackUrl);
      return;
    }

    if (role === 'STUDENT') router.push('/student/dashboard');
    else if (role === 'INSTRUCTOR') router.push('/instructor/dashboard');
    else if (role === 'MENTOR') router.push('/mentor/dashboard');
    else if (role === 'ORGANIZATION') router.push('/organization/dashboard');
    else if (role === 'SUPER_ADMIN') router.push('/admin/dashboard');
    else router.push('/student/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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
      } else {
        toast.success('Successfully logged in!');
        const session = await getSession();
        const role = session?.user?.role || 'STUDENT';
        redirectUserByRole(role);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        password: demoPass,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        setIsLoading(false);
      } else {
        toast.success(`Logged in as ${demoEmail.split('@')[0]}!`);
        const session = await getSession();
        const role = session?.user?.role || 'STUDENT';
        redirectUserByRole(role);
        router.refresh();
      }
    } catch (err: any) {
      setError('Demo login failed');
      toast.error('Demo login failed');
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="p-6 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs font-medium text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full py-2.5 font-semibold" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      {/* Quick Demo Login Preset Buttons */}
      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> One-Click Demo Logins
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoLogin('student@example.com', 'password123')}
            className="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-medium text-slate-700 dark:text-slate-200"
          >
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Student</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">student@example.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('instructor@example.com', 'password123')}
            className="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-medium text-slate-700 dark:text-slate-200"
          >
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Instructor</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">instructor@example.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('mentor@example.com', 'password123')}
            className="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-medium text-slate-700 dark:text-slate-200"
          >
            <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Mentor</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">mentor@example.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('admin@example.com', 'admin123')}
            className="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-medium text-slate-700 dark:text-slate-200"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">Super Admin</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">admin@example.com</div>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600 dark:text-slate-400">
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

        <Suspense fallback={<div className="p-6 text-center text-xs text-slate-500">Loading form...</div>}>
          <LoginFormContent />
        </Suspense>
      </Card>
    </div>
  );
}
