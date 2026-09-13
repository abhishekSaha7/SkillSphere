import { db } from '@/lib/db';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CourseApprovalButtons } from './CourseApprovalButtons';

export const revalidate = 0;

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    include: {
      instructor: true,
      modules: { include: { lessons: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Review & Approval Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Review instructor course submissions and control marketplace publishing.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Platform Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <div key={course.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{course.title}</h3>
                    <Badge variant={course.status === 'PUBLISHED' ? 'success' : course.status === 'PENDING_REVIEW' ? 'warning' : 'default'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Instructor: {course.instructor.name} • Category: {course.category} • {totalLessons} lessons • ${course.price}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 pt-1">{course.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <CourseApprovalButtons courseId={course.id} currentStatus={course.status} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
