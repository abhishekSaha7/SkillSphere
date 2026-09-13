import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Star, Briefcase, Calendar, Clock, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BookingModalButton } from './BookingModalButton';

export const revalidate = 0;

export default async function MentorDetailPage({ params }: { params: { id: string } }) {
  const mentor = await db.mentorProfile.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      availabilities: true,
    },
  });

  if (!mentor) {
    notFound();
  }

  const daysOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/mentors" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to Mentor Directory
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mentor Bio & Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden border-4 border-brand-500 shadow-md">
                <img src={mentor.user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={mentor.user.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">{mentor.user.name}</h1>
                <p className="text-sm text-brand-600 font-semibold">{mentor.title}</p>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 mr-1" /> {mentor.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{mentor.totalReviews} reviews</span>
                  <span>•</span>
                  <span>{mentor.yearsExperience} Years Exp.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">About Mentor</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{mentor.bio}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Technical Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.split(',').map((skill, idx) => (
                  <Badge key={idx} variant="info">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Offered Consultations</h3>
              <p className="text-xs text-slate-600">{mentor.consultationTypes}</p>
            </div>
          </Card>

          {/* Configured Weekly Availability Slots */}
          <Card className="p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" /> Weekly Availability Schedule
            </h3>
            {mentor.availabilities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom slots configured. Default week hours apply.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {mentor.availabilities.map((slot) => (
                  <div key={slot.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{daysOfWeekMap[slot.dayOfWeek]}s</span>
                    <span className="text-slate-600">{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="p-6 sticky top-24 space-y-6 shadow-xl border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Hourly Session Rate</span>
              <p className="text-3xl font-extrabold text-slate-900">${mentor.hourlyRate.toFixed(2)}</p>
            </div>

            <BookingModalButton mentorId={mentor.id} hourlyRate={mentor.hourlyRate} consultationTypes={mentor.consultationTypes} />

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant Google Meet URL generated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated calendar double-booking shield</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
