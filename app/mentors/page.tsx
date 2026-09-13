import Link from 'next/link';
import { db } from '@/lib/db';
import { Users, Search, Star, Briefcase, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function MentorsPage({
  searchParams,
}: {
  searchParams?: { search?: string; expertise?: string };
}) {
  const search = searchParams?.search || '';
  const expertise = searchParams?.expertise || 'ALL';

  const where: any = {};
  if (expertise !== 'ALL') where.expertise = { contains: expertise };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { bio: { contains: search } },
      { expertise: { contains: search } },
      { user: { name: { contains: search } } },
    ];
  }

  const mentors = await db.mentorProfile.findMany({
    where,
    include: { user: true, availabilities: true },
    orderBy: { rating: 'desc' },
  });

  const expertiseOptions = ['ALL', 'System Design', 'Career Coaching', 'Full Stack', 'Node.js', 'React'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <Badge variant="warning" className="bg-amber-950 text-amber-300 border-amber-800">
            1-on-1 Mentorship Directory
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Accelerate Your Career with Industry Mentors</h1>
          <p className="text-sm text-slate-300">
            Book 1-on-1 consultations for mock system design interviews, resume critiques, and technical guidance.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search mentor by name, company, or tech stack..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              name="expertise"
              defaultValue={expertise}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              {expertiseOptions.map((opt) => (
                <option key={opt} value={opt}>
                  Expertise: {opt}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Mentors Grid */}
      {mentors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No mentors found matching your query</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search term or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="p-6 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden border-2 border-brand-500">
                    <img src={mentor.user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={mentor.user.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{mentor.user.name}</h3>
                    <p className="text-xs text-brand-600 font-medium line-clamp-1">{mentor.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {mentor.rating.toFixed(1)} ({mentor.totalReviews} reviews)
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{mentor.bio}</p>

                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.split(',').map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px]">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Session Fee</span>
                  <span className="text-lg font-extrabold text-slate-900">${mentor.hourlyRate}/hr</span>
                </div>
                <Link href={`/mentors/${mentor.id}`}>
                  <Button size="sm">
                    Book Session &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
