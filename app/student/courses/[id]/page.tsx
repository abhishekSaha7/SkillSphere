'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, CheckCircle2, Circle, ArrowLeft, Award, FileText, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VideoService } from '@/lib/services/video.service';
import { useUIStore } from '@/store/useUIStore';

export default function StudentCoursePlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useUIStore();

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [certificateInfo, setCertificateInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkCertificateEligibility = React.useCallback(async () => {
    try {
      const res = await fetch('/api/certificates/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id }),
      });
      const data = await res.json();
      if (res.ok && data.isCompleted) {
        setCertificateInfo(data);
      } else {
        setCertificateInfo(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [params.id]);

  const fetchWorkspace = React.useCallback(async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${params.id}`);
      const courseData = await courseRes.json();

      // Fetch enrollments
      const enrollRes = await fetch('/api/enrollments');
      const enrollData = await enrollRes.json();

      const userEnrollment = enrollData.find((e: any) => e.courseId === params.id);

      if (courseRes.ok && userEnrollment) {
        setCourse(courseData);
        setEnrollment(userEnrollment);

        const doneIds = userEnrollment.progress
          .filter((p: any) => p.isCompleted)
          .map((p: any) => p.lessonId);
        setCompletedLessonIds(doneIds);

        // Set initial active lesson
        const firstLesson = courseData.modules[0]?.lessons[0];
        setActiveLesson(firstLesson || null);

        checkCertificateEligibility();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, checkCertificateEligibility]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!enrollment) return;
    const isDone = completedLessonIds.includes(lessonId);
    const newStatus = !isDone;

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          lessonId,
          isCompleted: newStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update progress');

      if (newStatus) {
        setCompletedLessonIds((prev) => [...prev, lessonId]);
        addToast({ type: 'success', title: 'Lesson Completed!' });
      } else {
        setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      }

      fetchWorkspace();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading learning environment...</div>;
  if (!course || !enrollment) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You are not enrolled in this course.</p>
        <Button onClick={() => router.push(`/courses/${params.id}`)}>View Course Landing Page</Button>
      </div>
    );
  }

  const allLessons = course.modules.flatMap((m: any) => m.lessons);
  const progressPercent = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;
  const videoMeta = VideoService.getEmbedUrl(activeLesson?.videoUrl);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button onClick={() => router.push('/student/courses')} className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 mb-1">
            <ArrowLeft className="w-4 h-4" /> Back to Enrolled Courses
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Progress</div>
            <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400">{progressPercent}% Completed</div>
          </div>
          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-brand-600 dark:bg-brand-400 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Completion & Certificate Banner */}
      {certificateInfo && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="bg-emerald-700 text-white">Course Completed</Badge>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">100% Course Requirements Fulfilled</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Congratulations! You have earned your official SkillSphere Certificate of Completion.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/certificates/verify/${certificateInfo.certificateCode}`)}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold shrink-0 shadow-sm"
          >
            <Award className="w-4 h-4 mr-2" /> Download Certificate
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video & Content Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center">
            {activeLesson?.videoUrl ? (
              <iframe
                src={videoMeta.embedUrl}
                title={activeLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-8 text-slate-400">
                <PlayCircle className="w-16 h-16 mx-auto mb-2 text-brand-500" />
                <p className="text-sm font-semibold text-white">{activeLesson?.title || 'Select a lesson to begin'}</p>
                <p className="text-xs text-slate-400 mt-1">Interactive Video Session</p>
              </div>
            )}
          </div>

          {activeLesson && (
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-500">Est. Duration: {activeLesson.duration} minutes</p>
                </div>

                <Button
                  variant={completedLessonIds.includes(activeLesson.id) ? 'outline' : 'primary'}
                  onClick={() => toggleLessonCompletion(activeLesson.id)}
                  className="font-semibold"
                >
                  {completedLessonIds.includes(activeLesson.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" /> Mark as Complete
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-900">Lesson Content & Notes:</p>
                <p>{activeLesson.content || 'Follow along with the video module above and practice hands-on exercises.'}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Curriculum Navigator */}
        <div>
          <Card className="max-h-[600px] overflow-y-auto">
            <CardHeader className="bg-slate-50 sticky top-0 z-10 py-3.5">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Course Modules</span>
                <span className="text-xs font-normal text-slate-500">{completedLessonIds.length}/{allLessons.length} Done</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {course.modules.map((mod: any, mIdx: number) => (
                <div key={mod.id} className="p-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 px-1">
                    {mIdx + 1}. {mod.title}
                  </h4>
                  <div className="space-y-1">
                    {mod.lessons.map((lesson: any) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={`w-full p-2.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 line-clamp-1 pr-2">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{lesson.duration}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
