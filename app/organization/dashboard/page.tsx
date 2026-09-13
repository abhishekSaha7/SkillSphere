import Link from 'next/link';
import { db } from '@/lib/db';
import { Building2, Users, BookOpen, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function OrganizationDashboardPage() {
  const instructors = await db.user.findMany({ where: { role: 'INSTRUCTOR' } });
  const courses = await db.course.findMany({ where: { status: 'PUBLISHED' } });

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
        <Badge variant="info" className="bg-emerald-950 text-emerald-300 border-emerald-800">
          Organization Enterprise Console
        </Badge>
        <h1 className="text-3xl font-extrabold mt-2">TechAcademy Global</h1>
        <p className="text-xs text-slate-300 mt-1">Manage corporate instructors, enterprise course bundles, and aggregated student rosters.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Affiliated Instructors</p>
            <p className="text-2xl font-extrabold text-slate-900">{instructors.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Courses</p>
            <p className="text-2xl font-extrabold text-slate-900">{courses.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled Students</p>
            <p className="text-2xl font-extrabold text-slate-900">420</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
