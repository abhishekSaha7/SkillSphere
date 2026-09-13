import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Calendar, Video, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function MentorBookingsPage() {
  const session = await getServerSession(authOptions);

  const mentorProfile = await db.mentorProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      bookings: {
        include: { student: true },
        orderBy: { date: 'asc' },
      },
    },
  });

  const bookings = mentorProfile?.bookings || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Consultation Bookings</h1>
        <p className="text-xs text-slate-500 mt-1">Review scheduled student sessions and join consultation video links.</p>
      </div>

      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No student bookings currently scheduled.
          </Card>
        ) : (
          bookings.map((b) => (
            <Card key={b.id} className="p-6 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{b.student.name}</h3>
                  <Badge variant="success">{b.status}</Badge>
                </div>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">{b.sessionType}</p>
                <p className="text-xs text-slate-500">📅 {b.date} • ⏰ {b.timeSlot} • Fee: ${b.fee}</p>
                {b.notes && <p className="text-xs text-slate-600 italic mt-1">&quot;{b.notes}&quot;</p>}
              </div>

              {b.meetingUrl && (
                <Link href={b.meetingUrl} target="_blank">
                  <Button size="sm" className="gap-1 font-semibold">
                    <Video className="w-4 h-4" /> Start Meeting
                  </Button>
                </Link>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
