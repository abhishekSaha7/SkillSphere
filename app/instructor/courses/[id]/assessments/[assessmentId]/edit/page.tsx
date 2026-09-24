'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, HelpCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

interface QuestionForm {
  questionText: string;
  questionType: 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: string[];
  correctAnswer: string;
}

export default function EditAssessmentPage({ params }: { params: { id: string; assessmentId: string } }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await fetch(`/api/courses/${params.id}/assessments/${params.assessmentId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch assessment');

        setTitle(data.title);
        setPassingScore(data.passingScore);

        const loadedQuestions = data.questions.map((q: any) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: typeof q.options === 'string' ? JSON.parse(q.options || '[]') : q.options,
          correctAnswer: q.correctAnswer,
        }));

        setQuestions(loadedQuestions.length > 0 ? loadedQuestions : [
          { questionText: '', questionType: 'MCQ', options: ['', '', '', ''], correctAnswer: '' }
        ]);
      } catch (err: any) {
        toast.error(err.message || 'Error loading assessment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [params.id, params.assessmentId]);

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        questionType: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionTypeChange = (index: number, type: 'MCQ' | 'MULTIPLE_ANSWER' | 'TRUE_FALSE' | 'SHORT_ANSWER') => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[index] };
      q.questionType = type;
      if (type === 'TRUE_FALSE') {
        q.options = ['True', 'False'];
        q.correctAnswer = 'True';
      } else if (type === 'SHORT_ANSWER') {
        q.options = [];
        q.correctAnswer = '';
      } else if (type === 'MCQ' || type === 'MULTIPLE_ANSWER') {
        if (q.options.length < 2) q.options = ['', '', '', ''];
      }
      updated[index] = q;
      return updated;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };
      const opts = [...q.options];
      opts[optIndex] = value;
      q.options = opts;
      updated[qIndex] = q;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter an assessment title');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      if (!q.correctAnswer.trim()) {
        toast.error(`Please select or enter the correct answer for Question ${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        passingScore: Number(passingScore) || 70,
        questions: questions.map((q) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          options: q.questionType === 'SHORT_ANSWER' ? [] : q.options.filter((o) => o.trim() !== ''),
          correctAnswer: q.correctAnswer.trim(),
        })),
      };

      const res = await fetch(`/api/courses/${params.id}/assessments/${params.assessmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update assessment');

      toast.success('🎉 Assessment Updated Successfully!');
      router.push(`/instructor/courses/${params.id}/edit`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading assessment details...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.push(`/instructor/courses/${params.id}/edit`)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Course Workspace
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Course Assessment</h1>
          <Badge variant="info">Edit Mode</Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assessment Settings Card */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" /> Assessment Configuration
          </CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Assessment Title"
                placeholder="e.g. Next.js 14 Fundamentals Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Passing Score (%)"
                type="number"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Questions Builder Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Questions ({questions.length})</h2>
            <Button type="button" onClick={handleAddQuestion} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Add Question
            </Button>
          </div>

          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="p-6 space-y-4 border-slate-200 dark:border-slate-800 relative">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  Question #{qIdx + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Question Text"
                    placeholder="e.g. What is the default component type in Next.js App Router?"
                    value={q.questionText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx].questionText = text;
                        return updated;
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Question Type
                  </label>
                  <select
                    value={q.questionType}
                    onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="MCQ" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Multiple Choice (MCQ)</option>
                    <option value="MULTIPLE_ANSWER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Multiple Answer</option>
                    <option value="TRUE_FALSE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">True / False</option>
                    <option value="SHORT_ANSWER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Short Answer</option>
                  </select>
                </div>
              </div>

              {/* Type-Specific Options */}
              {(q.questionType === 'MCQ' || q.questionType === 'MULTIPLE_ANSWER') && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Options (Select the radio/button for the Correct Answer)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctAnswer === opt && opt.trim() !== ''}
                          onChange={() => {
                            setQuestions((prev) => {
                              const updated = [...prev];
                              updated[qIdx].correctAnswer = opt;
                              return updated;
                            });
                          }}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <Input
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.questionType === 'TRUE_FALSE' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Correct Answer
                  </label>
                  <div className="flex gap-4">
                    {['True', 'False'].map((tfVal) => (
                      <label key={tfVal} className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name={`tf_${qIdx}`}
                          value={tfVal}
                          checked={q.correctAnswer === tfVal}
                          onChange={() => {
                            setQuestions((prev) => {
                              const updated = [...prev];
                              updated[qIdx].correctAnswer = tfVal;
                              return updated;
                            });
                          }}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                        />
                        <span>{tfVal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {q.questionType === 'SHORT_ANSWER' && (
                <div className="pt-2">
                  <Input
                    label="Expected Correct Answer (Exact match or case-insensitive text)"
                    placeholder="e.g. React Server Component"
                    value={q.correctAnswer}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuestions((prev) => {
                        const updated = [...prev];
                        updated[qIdx].correctAnswer = val;
                        return updated;
                      });
                    }}
                    required
                  />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/instructor/courses/${params.id}/edit`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="font-bold px-6">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
