import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookOpen, Calendar, Award, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  const enrollments = await db.enrollment.findMany({
    where: { userId: session?.user?.id },
    include: {
      course: {
        include: {
          instructor: true,
          modules: { include: { lessons: true } },
        },
      },
      progress: true,
    },
    orderBy: { enrolledAt: 'desc' },
  });

  const bookings = await db.mentorBooking.findMany({
    where: { studentId: session?.user?.id },
    include: { mentor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const certificates = await db.certificate.findMany({
    where: { userId: session?.user?.id },
    include: { course: true },
    orderBy: { issuedAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="info" className="bg-brand-950 text-brand-300 border-brand-800">
            Student Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {session?.user?.name || 'Learner'}! 👋</h1>
          <p className="text-xs text-slate-300">
            You are currently enrolled in {enrollments.length} active course(s) and have earned {certificates.length} certificate(s).
          </p>
        </div>
        <Link href="/courses">
          <Button className="bg-brand-500 hover:bg-brand-600 font-bold shrink-0">
            Browse More Courses <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Courses</p>
            <p className="text-2xl font-extrabold text-slate-900">{enrollments.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor Sessions</p>
            <p className="text-2xl font-extrabold text-slate-900">{bookings.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</p>
            <p className="text-2xl font-extrabold text-slate-900">{certificates.length}</p>
          </div>
        </Card>
      </div>

      {/* Enrolled Courses with Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>In Progress Courses</CardTitle>
          <Link href="/student/courses" className="text-xs font-semibold text-brand-600 hover:underline">
            View All &rarr;
          </Link>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {enrollments.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              You haven&apos;t enrolled in any courses yet.{' '}
              <Link href="/courses" className="font-semibold text-brand-600 underline">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            enrollments.map((enr) => {
              const allLessons = enr.course.modules.flatMap((m) => m.lessons);
              const completedCount = enr.progress.filter((p) => p.isCompleted).length;
              const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

              return (
                <div key={enr.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="space-y-1.5 max-w-lg">
                    <h3 className="font-bold text-slate-900 text-sm">{enr.course.title}</h3>
                    <p className="text-xs text-slate-500">Instructor: {enr.course.instructor.name}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-36 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-600 h-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{percent}% ({completedCount}/{allLessons.length} lessons)</span>
                    </div>
                  </div>

                  <Link href={`/student/courses/${enr.courseId}`}>
                    <Button size="sm" className="font-semibold">
                      <PlayCircle className="w-4 h-4 mr-1.5" /> Continue Learning
                    </Button>
                  </Link>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
