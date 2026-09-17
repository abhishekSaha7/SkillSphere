'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Award, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/assessments');
      const data = await res.json();
      if (res.ok) setAssessments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleStartQuiz = (assessment: any) => {
    setActiveAssessment(assessment);
    setAnswers({});
    setResult(null);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssessment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: activeAssessment.id,
          userAnswers: answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setResult(data);
      if (data.passed) {
        toast.success(`Quiz Passed! Score: ${data.score}%`);
      } else {
        toast.error(`Score: ${data.score}%. Passing mark: ${data.passingScore}%`);
      }
      fetchAssessments();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-slate-500">Loading quizzes...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assessments & Knowledge Checks</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Take interactive quizzes to validate course knowledge.</p>
      </div>

      {activeAssessment ? (
        <Card className="border-2 border-brand-500/40 p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <Badge variant="info">{activeAssessment.course.title}</Badge>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{activeAssessment.title}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveAssessment(null)}>
              Cancel Quiz
            </Button>
          </div>

          {result ? (
            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl text-center space-y-4 border border-slate-200 dark:border-slate-800">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto font-bold text-2xl ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {result.passed ? 'Congratulations! You Passed!' : 'Requires Practice'}
                </h3>
                <p className="text-sm font-semibold text-brand-600 mt-1">
                  Your Score: {result.score}% ({result.correctCount}/{result.totalQuestions} Correct)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Passing Score Threshold: {result.passingScore}%</p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button onClick={() => handleStartQuiz(activeAssessment)} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Retry Quiz
                </Button>
                <Button onClick={() => setActiveAssessment(null)} size="sm">
                  Back to Assessments List
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              {activeAssessment.questions.map((q: any, idx: number) => {
                const options = JSON.parse(q.options || '[]');
                return (
                  <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Q{idx + 1}. {q.questionText}
                    </p>
                    <div className="space-y-2">
                      {options.map((opt: string) => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                            answers[q.id] === opt
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleAnswerSelect(q.id, opt)}
                            className="text-brand-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting} className="font-bold px-6">
                  Submit Answers & Grade Quiz
                </Button>
              </div>
            </form>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 border-dashed">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No assessments available</h3>
              <p className="text-xs text-slate-500 mt-1">Quizzes will appear here when attached to your enrolled courses.</p>
            </Card>
          ) : (
            assessments.map((ass) => {
              const lastAttempt = ass.attempts[0];
              return (
                <Card key={ass.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="info">{ass.course.title}</Badge>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{ass.title}</h3>
                    <p className="text-xs text-slate-500">
                      {ass.questions.length} Questions • Passing Threshold: {ass.passingScore}%
                    </p>
                    {lastAttempt && (
                      <p className={`text-xs font-bold mt-1 ${lastAttempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Last Attempt: {lastAttempt.score}% ({lastAttempt.passed ? 'PASSED' : 'FAILED'})
                      </p>
                    )}
                  </div>

                  <Button onClick={() => handleStartQuiz(ass)} className="font-semibold">
                    {lastAttempt ? 'Retake Quiz' : 'Start Assessment'}
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
