import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookOpen, PlusCircle, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions);

  const courses = await db.course.findMany({
    where: { instructorId: session?.user?.id },
    include: {
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Course Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and edit your course modules, video links, and pricing.</p>
        </div>
        <Link href="/instructor/courses/new">
          <Button className="font-semibold">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Create Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Author Course Catalog ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {courses.map((course) => (
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
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit Content
                  </Button>
                </Link>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
