import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookOpen, Users, DollarSign, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function InstructorDashboardPage() {
  const session = await getServerSession(authOptions);

  const courses = await db.course.findMany({
    where: { instructorId: session?.user?.id },
    include: {
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const publishedCount = courses.filter((c) => c.status === 'PUBLISHED').length;
  const pendingCount = courses.filter((c) => c.status === 'PENDING_REVIEW').length;
  const totalStudents = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const totalRevenue = courses.reduce((acc, c) => acc + c.price * c._count.enrollments, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your courses, author content, and inspect student enrollments.</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="font-semibold">
            <PlusCircle className="w-4 h-4 mr-2" /> Create New Course
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Courses</p>
            <p className="text-2xl font-extrabold text-slate-900">{courses.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalStudents}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
            <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Courses List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Courses</CardTitle>
          <Link href="/instructor/courses" className="text-xs font-semibold text-brand-600 hover:underline">
            View All ({courses.length}) &rarr;
          </Link>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {courses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              You haven&apos;t created any courses yet.{' '}
              <Link href="/instructor/courses/new" className="font-semibold text-brand-600 underline">
                Create your first course now.
              </Link>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{course.title}</h3>
                    <Badge variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'PENDING_REVIEW' ? 'warning' : 'default'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{course.category} • ${course.price.toFixed(2)} • {course._count.enrollments} Students enrolled</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Manage Content
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="ghost" size="sm">
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
