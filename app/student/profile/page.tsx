'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store/useUIStore';

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const { addToast } = useUIStore();

  const [skills, setSkills] = useState('HTML, CSS, JavaScript, React, Next.js');
  const [learningGoals, setLearningGoals] = useState('Master Full-Stack Next.js 14 Development');
  const [bio, setBio] = useState('Aspiring software engineer building portfolio projects.');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Profile Updated!',
      message: 'Your learning goals and skills have been updated.',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile & Goals</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your skills, learning objectives, and bio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" /> Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Full Name" value={session?.user?.name || ''} disabled />
            <Input label="Email Address" value={session?.user?.email || ''} disabled />

            <Input
              label="Technical Skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Learning Goals
              </label>
              <textarea
                rows={3}
                value={learningGoals}
                onChange={(e) => setLearningGoals(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" className="font-semibold">
                <Save className="w-4 h-4 mr-1.5" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
