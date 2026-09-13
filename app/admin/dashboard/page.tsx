import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, BookOpen, ShieldCheck, DollarSign, Award, AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const totalUsers = await db.user.count();
  const studentCount = await db.user.count({ where: { role: 'STUDENT' } });
  const instructorCount = await db.user.count({ where: { role: 'INSTRUCTOR' } });
  const mentorCount = await db.user.count({ where: { role: 'MENTOR' } });

  const publishedCourses = await db.course.count({ where: { status: 'PUBLISHED' } });
  const pendingCourses = await db.course.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: { instructor: true },
  });

  const pendingKYCs = await db.kYCDocument.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
  });

  const totalOrders = await db.order.count();
  const totalPayments = await db.payment.findMany({ where: { status: 'COMPLETED' } });
  const totalRevenue = totalPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="danger" className="bg-purple-950 text-purple-300 border-purple-800">
            Super Admin Governance Console
          </Badge>
          <h1 className="text-3xl font-extrabold">System Overview & Platform Governance</h1>
          <p className="text-xs text-slate-300">
            Monitor platform metrics, process instructor verification credentials, approve pending courses, and track revenue.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Users</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalUsers}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{studentCount} Students • {instructorCount} Instructors</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Courses</p>
            <p className="text-2xl font-extrabold text-slate-900">{publishedCourses}</p>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">{pendingCourses.length} Pending Approval</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">KYC Verification Queue</p>
            <p className="text-2xl font-extrabold text-slate-900">{pendingKYCs.length}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Documents awaiting review</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{totalOrders} Processed Orders</p>
          </div>
        </Card>
      </div>

      {/* Pending Course Approvals Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Review & Approval Queue</CardTitle>
          <Link href="/admin/courses" className="text-xs font-semibold text-brand-600 hover:underline">
            Manage All Courses &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {pendingCourses.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-xs">No pending course submissions in review queue.</p>
          ) : (
            pendingCourses.map((c) => (
              <div key={c.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-500">Instructor: {c.instructor.name} • Category: {c.category} • Price: ${c.price}</p>
                </div>
                <Link href="/admin/courses">
                  <Button size="sm">Review Course</Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
