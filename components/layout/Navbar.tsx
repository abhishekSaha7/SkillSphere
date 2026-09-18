'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, ShoppingBag, LogOut, Menu, GraduationCap, Users, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { data: session } = useSession();
  const { toggleSidebar } = useUIStore();
  const cartItems = useCartStore((state) => state.items);

  const getDashboardLink = () => {
    if (!session?.user) return '/login';
    const role = session.user.role;
    if (role === 'STUDENT') return '/student/dashboard';
    if (role === 'INSTRUCTOR') return '/instructor/dashboard';
    if (role === 'MENTOR') return '/mentor/dashboard';
    if (role === 'ORGANIZATION') return '/organization/dashboard';
    if (role === 'SUPER_ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            {session && (
              <button
                onClick={toggleSidebar}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-900 to-brand-600 dark:from-white dark:via-brand-300 dark:to-brand-400">
                  SkillSphere
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold -mt-1">
                  Learning & Mentorship
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/courses" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Courses
            </Link>
            <Link href="/mentors" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Mentors
            </Link>
            <Link href="/marketplace" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </Link>
            <Link href="/discussions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Discussions
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle & Cart Link */}
            <ThemeToggle />
            <Link href="/marketplace" className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardLink()}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/80 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>

                <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {session.user.name?.[0] || 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{session.user.name}</p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize">{session.user.role.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
