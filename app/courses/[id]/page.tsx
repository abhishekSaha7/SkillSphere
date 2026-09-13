import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookOpen, CheckCircle, PlayCircle, Award, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EnrollButton } from './EnrollButton';

export const revalidate = 0;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const course = await db.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: {
        include: { instructorProfile: true },
      },
      modules: {
        include: {
          lessons: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
      assessments: true,
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    notFound();
  }

  let isEnrolled = false;
  if (session?.user?.id) {
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!existingEnrollment;
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="space-y-8">
      {/* Course Hero Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="info" className="bg-brand-950 text-brand-300 border-brand-800">
              {course.category}
            </Badge>
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              {course.level}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{course.title}</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                {course.instructor.name[0]}
              </div>
              <span>Created by <strong className="text-white">{course.instructor.name}</strong></span>
            </div>
            <span>•</span>
            <span>{totalLessons} Lessons</span>
            <span>•</span>
            <span>{course._count.enrollments} Students Enrolled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules & Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Course Content</h2>

          {course.modules.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No modules added to this course yet.</p>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, index) => (
                <Card key={module.id} className="overflow-hidden">
                  <CardHeader className="bg-slate-50 py-4">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>Module {index + 1}: {module.title}</span>
                      <span className="text-xs font-normal text-slate-500">{module.lessons.length} lessons</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-slate-100">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5 text-brand-600 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{lesson.title}</p>
                            <p className="text-[10px] text-slate-500">{lesson.duration} mins</p>
                          </div>
                        </div>
                        {lesson.isFree && <Badge variant="success" className="text-[10px]">Free Preview</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructor Details */}
          <div className="pt-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About the Instructor</h2>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {course.instructor.name[0]}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{course.instructor.name}</h3>
                  <p className="text-xs text-brand-600 font-medium">{course.instructor.instructorProfile?.title || 'Instructor'}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">{course.instructor.instructorProfile?.bio || 'Experienced educator and developer.'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Enrollment Box */}
        <div>
          <Card className="sticky top-24 shadow-xl border-slate-200">
            <div className="h-48 w-full bg-slate-800 relative">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <BookOpen className="w-12 h-12" />
                </div>
              )}
            </div>

            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Course Price</span>
                  <p className="text-3xl font-extrabold text-slate-900">${course.price.toFixed(2)}</p>
                </div>
                <Badge variant="success">Full Lifetime Access</Badge>
              </div>

              {isEnrolled ? (
                <Link href={`/student/courses/${course.id}`}>
                  <Button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold">
                    Go to Learning Portal &rarr;
                  </Button>
                </Link>
              ) : (
                <EnrollButton courseId={course.id} price={course.price} />
              )}

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Access on mobile, tablet & desktop</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Includes interactive quizzes & assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Verifiable Certificate upon 100% completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
