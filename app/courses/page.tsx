import Link from 'next/link';
import { db } from '@/lib/db';
import { BookOpen, Search, Filter, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function CourseCatalogPage({
  searchParams,
}: {
  searchParams?: { search?: string; category?: string; level?: string };
}) {
  const search = searchParams?.search || '';
  const category = searchParams?.category || 'ALL';
  const level = searchParams?.level || 'ALL';

  const where: any = { status: 'PUBLISHED' };
  if (category !== 'ALL') where.category = category;
  if (level !== 'ALL') where.level = level;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const courses = await db.course.findMany({
    where,
    include: {
      instructor: true,
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const categories = ['ALL', 'Web Development', 'Software Engineering', 'Data Science', 'Cloud & DevOps', 'Cybersecurity'];
  const levels = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <Badge variant="info" className="bg-brand-950 text-brand-300 border-brand-800">
            Course Marketplace
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Discover World-Class Tech Courses</h1>
          <p className="text-sm text-slate-300">
            Master the most in-demand skills through structured video lessons, hands-on modules, and industry certifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by keyword, skill, or title..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <select
              name="category"
              defaultValue={category}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              name="level"
              defaultValue={level}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  Level: {lvl}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No courses match your filter criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting your search query or selecting a different category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <Card key={course.id} className="hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="info">{course.category}</Badge>
                      <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white">{course.level}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span>By <strong className="text-slate-700 dark:text-slate-200">{course.instructor.name}</strong></span>
                      <span>{totalLessons} lessons • {course._count.enrollments} enrolled</span>
                    </div>
                  </CardContent>
                </div>

                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">${course.price.toFixed(2)}</span>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm">Course Details</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
