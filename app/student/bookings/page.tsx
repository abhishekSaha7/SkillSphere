import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, Video, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function StudentBookingsPage() {
  const session = await getServerSession(authOptions);

  const bookings = await db.mentorBooking.findMany({
    where: { studentId: session?.user?.id },
    include: {
      mentor: { include: { user: true } },
    },
    orderBy: { date: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Mentor Sessions</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your 1-on-1 consultations and join meeting links.</p>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border-dashed">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No sessions booked yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Book 1-on-1 sessions with senior tech mentors for system design practice, resume reviews, and code pairing.
          </p>
          <Link href="/mentors">
            <Button size="sm" className="mt-4">
              Browse Mentors Directory
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 space-y-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden border-2 border-brand-500">
                    <img src={booking.mentor.user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={booking.mentor.user.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{booking.mentor.user.name}</h3>
                      <Badge variant="success">{booking.status}</Badge>
                    </div>
                    <p className="text-xs text-brand-600 font-semibold">{booking.sessionType}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📅 {booking.date} • ⏰ {booking.timeSlot}
                    </p>
                  </div>
                </div>

                {booking.meetingUrl && (
                  <Link href={booking.meetingUrl} target="_blank">
                    <Button size="sm" className="bg-brand-600 hover:bg-brand-700 font-semibold gap-1.5">
                      <Video className="w-4 h-4" /> Join Video Call <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>

              {booking.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-700">Student Notes:</span> {booking.notes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
