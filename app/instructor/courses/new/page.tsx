'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useUIStore } from '@/store/useUIStore';

export default function NewCoursePage() {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');
  const [price, setPrice] = useState(49.99);
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          price,
          thumbnail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create course');

      addToast({
        type: 'success',
        title: 'Course Created!',
        message: 'Now add modules and lessons to your course.',
      });

      router.push(`/instructor/courses/${data.id}/edit`);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
        <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-t-xl">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" /> Create New Course
          </CardTitle>
          <p className="text-xs text-slate-300">Set basic metadata for your educational course.</p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Course Title"
              placeholder="e.g. Master TypeScript & React 18 from Scratch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Course Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive summary of what students will learn in this course..."
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Web Development" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Web Development</option>
                  <option value="Software Engineering" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Software Engineering</option>
                  <option value="Data Science" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Data Science</option>
                  <option value="Cloud & DevOps" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cloud & DevOps</option>
                  <option value="Cybersecurity" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cybersecurity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="BEGINNER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">BEGINNER</option>
                  <option value="INTERMEDIATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">INTERMEDIATE</option>
                  <option value="ADVANCED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ADVANCED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price ($ USD)"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />

              <Input
                label="Thumbnail Image URL"
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isLoading} className="font-semibold px-6">
                Save & Continue to Modules &rarr;
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
