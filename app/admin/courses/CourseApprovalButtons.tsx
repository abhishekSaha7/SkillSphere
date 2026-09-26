'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, BookOpen, Video, CheckCircle2, XCircle, Award, Layers, PlayCircle, FileText, ArrowLeft, HelpCircle, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/store/useUIStore';

export function CourseApprovalButtons({ course }: { course: any }) {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{ lesson: any; moduleTitle: string } | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);

  const courseId = course.id;
  const currentStatus = course.status;

  const updateStatus = async (status: 'PUBLISHED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, status }),
      });

      if (!res.ok) throw new Error('Failed to update course status');

      addToast({
        type: 'success',
        title: 'Status Updated!',
        message: `Course set to ${status}. Notification sent to instructor.`,
      });

      setIsPreviewOpen(false);
      router.refresh();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

  // Video URL parser for YouTube, Vimeo, direct HTML5 video files, and storage buckets
  const getVideoPlayerInfo = (url?: string | null) => {
    if (!url) return { isVideo: false, type: 'none', src: '' };
    const cleanUrl = url.trim();

    // YouTube
    const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
      return { isVideo: true, type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return { isVideo: true, type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // Direct video file extensions or storage data
    const lower = cleanUrl.toLowerCase();
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.startsWith('data:video') ||
      lower.includes('supabase') ||
      lower.includes('cloudinary') ||
      lower.includes('s3.amazonaws.com')
    ) {
      return { isVideo: true, type: 'html5', src: cleanUrl };
    }

    // Fallback for general web video URLs
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return { isVideo: true, type: 'html5', src: cleanUrl };
    }

    return { isVideo: false, type: 'link', src: cleanUrl };
  };

  // Helper to parse stringified JSON options
  const parseOptions = (optionsRaw: any): string[] => {
    if (!optionsRaw) return [];
    if (Array.isArray(optionsRaw)) return optionsRaw;
    if (typeof optionsRaw === 'string') {
      try {
        const parsed = JSON.parse(optionsRaw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return optionsRaw.split(',').map((s) => s.trim());
      }
    }
    return [String(optionsRaw)];
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          className="font-medium text-xs gap-1 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Preview Course
        </Button>

        {currentStatus !== 'PUBLISHED' && (
          <Button
            size="sm"
            onClick={() => updateStatus('PUBLISHED')}
            isLoading={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            Approve & Publish
          </Button>
        )}
        {currentStatus !== 'REJECTED' && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => updateStatus('REJECTED')}
            isLoading={isLoading}
            className="text-xs"
          >
            Reject
          </Button>
        )}
      </div>

      {/* Main Course Overview Modal */}
      <Modal
        isOpen={isPreviewOpen && !activeLesson && !activeAssessment}
        onClose={() => setIsPreviewOpen(false)}
        title={`Course Preview — ${course.title}`}
      >
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Header Banner & Metadata */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            {course.thumbnail && (
              <div className="h-40 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="info">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant={currentStatus === 'PUBLISHED' ? 'success' : currentStatus === 'PENDING_REVIEW' ? 'warning' : 'danger'}>
                  {currentStatus}
                </Badge>
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">${course.price?.toFixed(2)}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Created by <strong className="text-slate-800 dark:text-slate-200">{course.instructor?.name || 'Instructor'}</strong> ({course.instructor?.email})
            </p>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {course.description}
            </p>
          </div>

          {/* Course Modules & Lessons Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Modules & Curriculum ({course.modules?.length || 0} Modules • {totalLessons} Lessons)
            </h4>

            {course.modules?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">No modules added to this course yet.</p>
            ) : (
              <div className="space-y-3">
                {course.modules?.map((mod: any, mIdx: number) => (
                  <div key={mod.id || mIdx} className="p-3.5 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold flex items-center justify-center">
                        {mIdx + 1}
                      </span>
                      Module {mIdx + 1}: {mod.title}
                    </h5>

                    <div className="space-y-1.5 pl-2">
                      {mod.lessons?.map((lesson: any, lIdx: number) => (
                        <div key={lesson.id || lIdx} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Video className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {lesson.videoUrl && (
                              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full">
                                Video Included
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{lesson.duration}m</span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setActiveLesson({ lesson, moduleTitle: mod.title })}
                              className="text-[11px] h-7 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold"
                            >
                              <PlayCircle className="w-3 h-3 mr-1 text-brand-600 dark:text-brand-400" /> View Lesson
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assessments & Quizzes Preview */}
          {course.assessments && course.assessments.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Course Assessments ({course.assessments.length})
              </h4>
              <div className="space-y-2">
                {course.assessments.map((ass: any, aIdx: number) => (
                  <div key={ass.id || aIdx} className="p-3 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{ass.title}</span>
                      <Badge variant="warning">Passing Score: {ass.passingScore}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-300">
                        Contains {ass.questions?.length || 0} questions for student evaluation.
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveAssessment(ass)}
                        className="text-[11px] h-7 px-2.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 font-semibold text-amber-900 dark:text-amber-100"
                      >
                        <HelpCircle className="w-3 h-3 mr-1" /> View Assessment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
              Close Preview
            </Button>
            {currentStatus !== 'REJECTED' && (
              <Button size="sm" variant="danger" onClick={() => updateStatus('REJECTED')} isLoading={isLoading}>
                Reject Course
              </Button>
            )}
            {currentStatus !== 'PUBLISHED' && (
              <Button size="sm" onClick={() => updateStatus('PUBLISHED')} isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Approve & Publish
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Sub-Modal: Read-Only Lesson Video & Content Inspector */}
      {activeLesson && (
        <Modal
          isOpen={!!activeLesson}
          onClose={() => setActiveLesson(null)}
          title={`Lesson Inspector — ${activeLesson.lesson.title}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Security Badge & Breadcrumb */}
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Module: {activeLesson.moduleTitle}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{activeLesson.lesson.title}</h4>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
                <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Read-Only Preview
              </span>
            </div>

            {/* Video Player Section */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Submitted Video Artifact
              </h5>

              {(() => {
                const playerInfo = getVideoPlayerInfo(activeLesson.lesson.videoUrl);

                if (playerInfo.type === 'iframe') {
                  return (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">
                      <iframe
                        src={playerInfo.src}
                        className="w-full h-64 md:h-80 border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                if (playerInfo.type === 'html5') {
                  return (
                    <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center min-h-[220px]">
                      <video
                        src={playerInfo.src}
                        controls
                        controlsList="nodownload"
                        className="w-full max-h-80 rounded-xl bg-black object-contain"
                      />
                    </div>
                  );
                }

                if (activeLesson.lesson.videoUrl) {
                  return (
                    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-3">
                      <Video className="w-10 h-10 text-brand-400 mx-auto" />
                      <p className="text-xs text-slate-300">External media link attached to lesson</p>
                      <a
                        href={activeLesson.lesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
                      >
                        Open External Video Stream <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </div>
                  );
                }

                return (
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">No video recording uploaded for this lesson. (Textual content only)</p>
                  </div>
                );
              })()}
            </div>

            {/* Lesson Textual Content */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> Lesson Body & Text Material
              </h5>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                {activeLesson.lesson.content || 'No text description or notes provided for this lesson.'}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={() => setActiveLesson(null)} className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Course Curriculum
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sub-Modal: Read-Only Assessment & Question Inspector */}
      {activeAssessment && (
        <Modal
          isOpen={!!activeAssessment}
          onClose={() => setActiveAssessment(null)}
          title={`Assessment Inspector — ${activeAssessment.title}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Metadata */}
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800/80 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{activeAssessment.title}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Passing Threshold: <span className="font-bold text-amber-700 dark:text-amber-400">{activeAssessment.passingScore}%</span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-2.5 py-1 rounded-full">
                <ShieldAlert className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Read-Only Assessment Review
              </span>
            </div>

            {/* Questions Breakdown */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" /> Assessment Questions ({activeAssessment.questions?.length || 0})
              </h5>

              {activeAssessment.questions?.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-center">
                  No questions created for this assessment yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeAssessment.questions?.map((q: any, qIdx: number) => {
                    const optionsList = parseOptions(q.options);
                    return (
                      <div key={q.id || qIdx} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <h6 className="font-bold text-slate-900 dark:text-white text-sm flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                              Q{qIdx + 1}
                            </span>
                            <span>{q.questionText}</span>
                          </h6>
                          <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                            {q.questionType || 'MCQ'}
                          </Badge>
                        </div>

                        {/* Options List */}
                        {optionsList.length > 0 && (
                          <div className="space-y-1.5 pl-7">
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Option Choices:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {optionsList.map((opt, oIdx) => {
                                const isCorrect = String(q.correctAnswer).trim() === String(opt).trim() || String(q.correctAnswer) === String(oIdx);
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                      isCorrect
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 font-semibold'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {isCorrect && (
                                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 shrink-0 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                                        <Check className="w-3 h-3" /> Correct Answer
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Explicit Correct Answer Badge for Non-MCQ / Fallback */}
                        {optionsList.length === 0 && (
                          <div className="pl-7 pt-1">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Correct Answer: <strong>{q.correctAnswer}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={() => setActiveAssessment(null)} className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Course Curriculum
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

