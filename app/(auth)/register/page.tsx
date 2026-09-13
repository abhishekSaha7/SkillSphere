'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, User, Briefcase, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR' | 'MENTOR' | 'ORGANIZATION'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          name,
          email,
          password,
          title,
          companyName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const roleCards = [
    { type: 'STUDENT', label: 'Student', desc: 'Enroll in courses & book mentors', icon: User },
    { type: 'INSTRUCTOR', label: 'Instructor', desc: 'Create & sell online courses', icon: GraduationCap },
    { type: 'MENTOR', label: 'Mentor', desc: 'Offer 1-on-1 career consultation', icon: Briefcase },
    { type: 'ORGANIZATION', label: 'Organization', desc: 'Manage enterprise academy', icon: Building2 },
  ];

  return (
    <div className="max-w-lg mx-auto my-8 px-4">
      <Card className="border-slate-200/90 shadow-xl">
        <CardHeader className="text-center bg-brand-900 text-white py-6 rounded-t-xl">
          <CardTitle className="text-xl font-bold text-white">Create SkillSphere Account</CardTitle>
          <p className="text-xs text-brand-200 mt-1">Select your role and start your professional journey</p>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {success}
            </div>
          )}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {roleCards.map((rc) => {
                const Icon = rc.icon;
                const isSelected = role === rc.type;
                return (
                  <button
                    key={rc.type}
                    type="button"
                    onClick={() => setRole(rc.type as any)}
                    className={`p-3 border rounded-xl text-left transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-brand-600' : 'text-slate-500'}`} />
                    <div className="font-semibold text-xs text-slate-900">{rc.label}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{rc.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name / Organization Name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
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

            {(role === 'INSTRUCTOR' || role === 'MENTOR') && (
              <Input
                label="Professional Title"
                placeholder="e.g. Senior Software Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}

            {role === 'ORGANIZATION' && (
              <Input
                label="Company / Institution Name"
                placeholder="e.g. TechAcademy Global"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            )}

            <Button type="submit" className="w-full py-2.5 font-semibold mt-2" isLoading={isLoading}>
              Register as {role.replace('_', ' ')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
