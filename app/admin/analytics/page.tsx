import { db } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { AnalyticsCharts } from './AnalyticsCharts';
import { format } from 'date-fns';
import { Users, BookOpen, Calendar, Award, Layers, ShieldCheck, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [
    usersCount,
    enrollmentsCount,
    bookingsCount,
    certificatesCount,
    coursesCount,
    pendingCoursesCount,
    pendingKycCount,
    rawUsers,
    rawEnrollments,
    rawCertificates,
    rawBookings,
    courseStatusGroup,
    kycStatusGroup,
  ] = await Promise.all([
    db.user.count(),
    db.enrollment.count(),
    db.mentorBooking.count(),
    db.certificate.count(),
    db.course.count(),
    db.course.count({ where: { status: 'PENDING_REVIEW' } }),
    db.kYCDocument.count({ where: { status: 'PENDING' } }),
    db.user.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'asc' } }),
    db.enrollment.findMany({ select: { enrolledAt: true }, orderBy: { enrolledAt: 'asc' } }),
    db.certificate.findMany({ select: { issuedAt: true }, orderBy: { issuedAt: 'asc' } }),
    db.mentorBooking.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'asc' } }),
    db.course.groupBy({ by: ['status'], _count: { status: true } }),
    db.kYCDocument.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  // Aggregate time-series into date buckets
  const aggregateTimeSeries = (dates: (Date | null)[]) => {
    const buckets: { [key: string]: { date: string; count: number; timestamp: number } } = {};
    dates.forEach((d) => {
      if (!d) return;
      const dateObj = new Date(d);
      const key = format(dateObj, 'MMM d');
      const ts = dateObj.getTime();
      if (!buckets[key]) {
        buckets[key] = { date: key, count: 0, timestamp: ts };
      }
      buckets[key].count += 1;
    });
    return Object.values(buckets);
  };

  const userGrowth = aggregateTimeSeries(rawUsers.map((u) => u.createdAt));
  const enrollmentTrends = aggregateTimeSeries(rawEnrollments.map((e) => e.enrolledAt));
  const certificateTrends = aggregateTimeSeries(rawCertificates.map((c) => c.issuedAt));
  const bookingTrends = aggregateTimeSeries(rawBookings.map((b) => b.createdAt));

  const courseStatusDistribution = courseStatusGroup.map((g) => ({
    name: g.status,
    value: g._count.status,
  }));

  const kycStatusDistribution = kycStatusGroup.map((g) => ({
    name: g.status,
    value: g._count.status,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics & Growth Trends</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          High-level statistical breakdown of user growth, course completions, and booking volume.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-l-4 border-l-brand-600 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
            <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{usersCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Registered Platform Accounts</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-600 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course Enrollments</p>
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{enrollmentsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Active & Completed Student Seats</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-sky-600 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mentor Consultations</p>
            <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{bookingsCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Scheduled & Conducted Sessions</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certificates Awarded</p>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{certificatesCount}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Verified Completion Credentials</p>
        </Card>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Catalog Courses</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{coursesCount}</span>
          </div>
          <Layers className="w-5 h-5 text-purple-500" />
        </div>

        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-800 dark:text-amber-300 block">Pending Course Approvals</span>
            <span className="text-xl font-bold text-amber-900 dark:text-amber-100">{pendingCoursesCount}</span>
          </div>
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="p-4 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-sky-800 dark:text-sky-300 block">Pending KYC Reviews</span>
            <span className="text-xl font-bold text-sky-900 dark:text-sky-100">{pendingKycCount}</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>
      </div>

      {/* Visual Recharts Charts Section */}
      <AnalyticsCharts
        userGrowth={userGrowth}
        enrollmentTrends={enrollmentTrends}
        courseStatusDistribution={courseStatusDistribution}
        kycStatusDistribution={kycStatusDistribution}
        certificateTrends={certificateTrends}
        bookingTrends={bookingTrends}
      />
    </div>
  );
}
