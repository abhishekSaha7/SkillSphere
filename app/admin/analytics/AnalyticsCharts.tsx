'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  Layers,
  ShieldCheck,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AnalyticsChartsProps {
  userGrowth: { date: string; count: number; timestamp: number }[];
  enrollmentTrends: { date: string; count: number; timestamp: number }[];
  courseStatusDistribution: { name: string; value: number }[];
  kycStatusDistribution: { name: string; value: number }[];
  certificateTrends: { date: string; count: number; timestamp: number }[];
  bookingTrends: { date: string; count: number; timestamp: number }[];
}

const COLORS = {
  primary: '#6366f1', // Indigo
  success: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  danger: '#ef4444', // Red
  sky: '#0ea5e9', // Sky blue
  purple: '#8b5cf6', // Purple
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#0ea5e9'];

export function AnalyticsCharts({
  userGrowth,
  enrollmentTrends,
  courseStatusDistribution,
  kycStatusDistribution,
  certificateTrends,
  bookingTrends,
}: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '6m' | 'all'>('all');

  // Filter time-series data according to selected timeframe
  const filterByTimeRange = (data: { date: string; count: number; timestamp: number }[]) => {
    if (!data || data.length === 0) return [];
    if (timeRange === 'all') return data;

    const now = Date.now();
    const days = timeRange === '30d' ? 30 : 180;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return data.filter((item) => item.timestamp >= cutoff);
  };

  const filteredUserGrowth = useMemo(() => filterByTimeRange(userGrowth), [userGrowth, timeRange]);
  const filteredEnrollments = useMemo(() => filterByTimeRange(enrollmentTrends), [enrollmentTrends, timeRange]);
  const filteredCertificates = useMemo(() => filterByTimeRange(certificateTrends), [certificateTrends, timeRange]);
  const filteredBookings = useMemo(() => filterByTimeRange(bookingTrends), [bookingTrends, timeRange]);

  return (
    <div className="space-y-6">
      {/* Dashboard Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span className="font-bold text-slate-900 dark:text-white text-sm">Visual Analytics & Trend Visualizations</span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Timeframe:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === '6m'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === 'all'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: User Growth & Course Enrollments Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Area Chart */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> Platform User Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredUserGrowth.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No user growth data recorded for this period yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredUserGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="count" name="New Users" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#userGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollment Line Chart */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Course Enrollment Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredEnrollments.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No course enrollments recorded for this period yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="count" name="Enrollments" stroke={COLORS.success} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Status Distributions (Course Status & KYC Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Distribution */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" /> Course Publishing Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {courseStatusDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No courses created yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseStatusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" name="Courses" radius={[6, 6, 0, 0]}>
                      {courseStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC Verification Status */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-500" /> KYC Document Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {kycStatusDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No KYC documents submitted yet.
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kycStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {kycStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-kyc-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Certificate Issuance & Consultation Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Issuance Trend */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Certificates Awarded Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredCertificates.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No course completion certificates issued in this period yet.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredCertificates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Certificates" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentor Consultation Booking Trend */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" /> Mentor Consultation Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredBookings.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 rounded-xl">
                No mentor consultations booked in this period yet.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredBookings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#888888" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="count" name="Bookings" stroke={COLORS.sky} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
