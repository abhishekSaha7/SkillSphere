import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, DollarSign, Users, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function MentorDashboardPage() {
  const session = await getServerSession(authOptions);

  const mentorProfile = await db.mentorProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      availabilities: true,
      bookings: { include: { student: true } },
    },
  });

  const totalBookings = mentorProfile?.bookings.length || 0;
  const totalEarnings = mentorProfile?.bookings.reduce((acc, b) => acc + b.fee, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage consultation availability, review bookings, and monitor session earnings.</p>
        </div>
        <Link href="/mentor/availability">
          <Button className="font-semibold">
            <Calendar className="w-4 h-4 mr-2" /> Configure Weekly Slots
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalBookings}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Earnings</p>
            <p className="text-2xl font-extrabold text-slate-900">${totalEarnings.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating Score</p>
            <p className="text-2xl font-extrabold text-slate-900">{mentorProfile?.rating.toFixed(1) || '5.0'}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Consultations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {!mentorProfile || mentorProfile.bookings.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-xs">No student bookings yet.</p>
          ) : (
            mentorProfile.bookings.map((booking) => (
              <div key={booking.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{booking.student.name}</h3>
                    <Badge variant="success">{booking.status}</Badge>
                  </div>
                  <p className="text-xs text-brand-600 font-semibold mt-0.5">{booking.sessionType}</p>
                  <p className="text-xs text-slate-500">
                    📅 {booking.date} • ⏰ {booking.timeSlot} • Fee: ${booking.fee}
                  </p>
                </div>
                {booking.meetingUrl && (
                  <Link href={booking.meetingUrl} target="_blank">
                    <Button size="sm" variant="outline">
                      Join Video Call
                    </Button>
                  </Link>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
