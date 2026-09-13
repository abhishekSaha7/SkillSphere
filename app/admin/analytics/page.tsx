import { db } from '@/lib/db';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const usersCount = await db.user.count();
  const enrollmentsCount = await db.enrollment.count();
  const bookingsCount = await db.mentorBooking.count();
  const certificatesCount = await db.certificate.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Analytics & Growth Trends</h1>
        <p className="text-xs text-slate-500 mt-1">High-level statistical breakdown of user growth, course completions, and booking volume.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{usersCount}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Enrollments</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{enrollmentsCount}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentor Consultations</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{bookingsCount}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates Awarded</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{certificatesCount}</p>
        </Card>
      </div>
    </div>
  );
}
