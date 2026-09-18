import Link from 'next/link';
import { db } from '@/lib/db';
import { GraduationCap, Users, BookOpen, ArrowRight, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function HomePage() {
  const publishedCourses = await db.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      instructor: true,
      modules: { include: { lessons: true } },
    },
    take: 3,
  });

  const mentors = await db.mentorProfile.findMany({
    include: { user: true },
    take: 3,
  });

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <Badge variant="info" className="bg-brand-950/80 text-brand-300 border-brand-800 text-xs px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-400 inline" /> Next-Gen Learning & Professional Mentorship
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Elevate your skills with <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-brand-200 to-purple-300">expert-led courses</span> & 1-on-1 mentorship.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            SkillSphere connects ambitious learners with verified industry leaders, hands-on courses, real-time consultation sessions, and accredited certifications.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/courses">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 font-bold shadow-lg shadow-brand-500/30">
                Explore Courses <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/mentors">
              <Button variant="outline" size="lg" className="border-slate-700 text-white bg-slate-800/80 hover:bg-slate-800">
                Book a Mentor
              </Button>
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">500+</p>
              <p className="text-xs text-slate-400">Verified Courses</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">120+</p>
              <p className="text-xs text-slate-400">Expert Mentors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</p>
              <p className="text-xs text-slate-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Tailored Portals for Every Role</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose your pathway and unlock specialized tools designed for your goals.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:border-brand-500 hover:shadow-md transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Students</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Track course progress, take interactive quizzes, earn certificates, and book mentor sessions.
                </p>
              </div>
              <Link href="/login" className="block text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                Student Dashboard &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-purple-500 hover:shadow-md transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Instructors</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Author rich multi-module courses, create assessments, and monitor student analytics.
                </p>
              </div>
              <Link href="/login" className="block text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                Instructor Console &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500 hover:shadow-md transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Mentors</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Configure recurring availability, set session fees, and accept 1-on-1 consultations.
                </p>
              </div>
              <Link href="/login" className="block text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                Mentor Suite &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500 hover:shadow-md transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Super Admins</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Govern platform operations, verify KYC submissions, approve courses, and track revenue.
                </p>
              </div>
              <Link href="/login" className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                Admin Control Panel &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Courses</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top-rated learning experiences curated by industry professionals.</p>
          </div>
          <Link href="/courses">
            <Button variant="ghost" size="sm">
              View All Courses &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedCourses.map((course) => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <Card key={course.id} className="hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="info">{course.category}</Badge>
                      <Badge variant="outline" className="bg-white/90 dark:bg-slate-900/90">{course.level}</Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Instructor: <strong className="text-slate-700 dark:text-slate-200">{course.instructor.name}</strong></span>
                      <span>•</span>
                      <span>{totalLessons} Lessons</span>
                    </div>
                  </CardContent>
                </div>

                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">${course.price.toFixed(2)}</span>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Mentors</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Book 1-on-1 sessions for career guidance, resume reviews, and code pairings.</p>
          </div>
          <Link href="/mentors">
            <Button variant="ghost" size="sm">
              Discover Mentors &rarr;
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="p-6 space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border-2 border-brand-500">
                  <img src={mentor.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={mentor.user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{mentor.user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{mentor.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {mentor.rating.toFixed(1)} ({mentor.totalReviews} reviews)
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{mentor.bio}</p>

              <div className="flex flex-wrap gap-1.5">
                {mentor.expertise.split(',').map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px]">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">${mentor.hourlyRate}/hr</span>
                <Link href={`/mentors/${mentor.id}`}>
                  <Button size="sm" variant="outline">
                    Book Session
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Demo Credentials Footer Banner */}
      <section className="p-6 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Instant Portfolio Demo Access
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Test as Student, Instructor, Mentor, or Super Admin instantly without setup.
          </p>
        </div>
        <Link href="/login">
          <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
            Open Login Demo &rarr;
          </Button>
        </Link>
      </section>
    </div>
  );
}
