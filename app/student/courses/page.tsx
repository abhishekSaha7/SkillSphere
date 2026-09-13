import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookOpen, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export const revalidate = 0;

export default async function StudentCoursesPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Enrolled Courses</h1>
        <p className="text-xs text-slate-500 mt-1">Access all your active learning courses and track completion progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollments.map((enr) => {
          const allLessons = enr.course.modules.flatMap((m) => m.lessons);
          const completedCount = enr.progress.filter((p) => p.isCompleted).length;
          const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

          return (
            <Card key={enr.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {enr.course.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{percent}% Completed</span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{enr.course.title}</h3>
                <p className="text-xs text-slate-500">Instructor: {enr.course.instructor.name}</p>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{completedCount} of {allLessons.length} lessons finished</span>
                <Link href={`/student/courses/${enr.courseId}`}>
                  <Button size="sm">
                    <PlayCircle className="w-4 h-4 mr-1" /> Resume
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
