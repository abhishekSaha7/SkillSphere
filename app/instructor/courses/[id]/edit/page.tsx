'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, PlayCircle, Trash2, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/useUIStore';

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setCourse(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/courses/${params.id}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: moduleTitle }),
      });

      if (!res.ok) throw new Error('Failed to add module');

      addToast({ type: 'success', title: 'Module Added!' });
      setModuleTitle('');
      setIsModuleModalOpen(false);
      fetchCourse();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModuleId) return;

    try {
      const res = await fetch(`/api/modules/${activeModuleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lessonTitle,
          videoUrl: lessonVideoUrl,
          duration: lessonDuration,
        }),
      });

      if (!res.ok) throw new Error('Failed to add lesson');

      addToast({ type: 'success', title: 'Lesson Added!' });
      setLessonTitle('');
      setLessonVideoUrl('');
      setIsLessonModalOpen(false);
      fetchCourse();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PENDING_REVIEW' }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      addToast({
        type: 'success',
        title: 'Submitted for Review!',
        message: 'A Super Admin will review your course shortly.',
      });
      fetchCourse();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-slate-500">Loading course workspace...</div>;
  if (!course) return <div className="p-8 text-center text-xs text-red-500">Course not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={() => router.push('/instructor/courses')} className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to My Courses
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <Badge variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'PENDING_REVIEW' ? 'warning' : 'default'}>
              {course.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {course.status !== 'PUBLISHED' && course.status !== 'PENDING_REVIEW' && (
            <Button onClick={handleSubmitForReview} className="bg-amber-600 hover:bg-amber-700 font-semibold">
              <Send className="w-4 h-4 mr-2" /> Submit for Admin Review
            </Button>
          )}
          <Button onClick={() => setIsModuleModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Module
          </Button>
        </div>
      </div>

      {/* Course Modules & Lessons */}
      <div className="space-y-4">
        {course.modules.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 border-dashed">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No modules in this course yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first module (e.g. &quot;Module 1: Getting Started&quot;) to start attaching video lessons.
            </p>
            <Button onClick={() => setIsModuleModalOpen(true)} className="mt-4" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Create First Module
            </Button>
          </Card>
        ) : (
          course.modules.map((mod: any, idx: number) => (
            <Card key={mod.id} className="overflow-hidden border-slate-200">
              <CardHeader className="bg-slate-50 py-3.5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Module {idx + 1}: {mod.title}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveModuleId(mod.id);
                    setIsLessonModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Lesson
                </Button>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-slate-100">
                {mod.lessons.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 italic">No lessons added to this module yet.</p>
                ) : (
                  mod.lessons.map((lesson: any) => (
                    <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4 text-brand-600 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{lesson.title}</p>
                          <p className="text-[10px] text-slate-500">{lesson.duration} mins • Video: {lesson.videoUrl || 'Default reference'}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Lesson
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Module Modal */}
      <Modal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} title="Create Course Module">
        <form onSubmit={handleAddModule} className="space-y-4">
          <Input
            label="Module Title"
            placeholder="e.g. Module 1: Core Fundamentals"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Module</Button>
          </div>
        </form>
      </Modal>

      {/* Lesson Modal */}
      <Modal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} title="Add Lesson to Module">
        <form onSubmit={handleAddLesson} className="space-y-4">
          <Input
            label="Lesson Title"
            placeholder="e.g. Introduction to Component Architecture"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            required
          />
          <Input
            label="Video URL / YouTube Embed"
            placeholder="https://www.youtube.com/embed/..."
            value={lessonVideoUrl}
            onChange={(e) => setLessonVideoUrl(e.target.value)}
          />
          <Input
            label="Duration (in minutes)"
            type="number"
            min="1"
            value={lessonDuration}
            onChange={(e) => setLessonDuration(parseInt(e.target.value) || 10)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lesson</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
