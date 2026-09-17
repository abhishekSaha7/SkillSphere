'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Award,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  PlusCircle,
  CheckSquare,
  X,
  GraduationCap,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setSidebarOpen]);

  if (!session) return null;
  const role = session.user.role;

  const studentLinks = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Mentor Sessions', href: '/student/bookings', icon: Calendar },
    { label: 'Assessments', href: '/student/assessments', icon: CheckSquare },
    { label: 'Certificates', href: '/student/certificates', icon: Award },
    { label: 'Profile', href: '/student/profile', icon: Settings },
  ];

  const instructorLinks = [
    { label: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'Course Catalog', href: '/instructor/courses', icon: BookOpen },
    { label: 'Create Course', href: '/instructor/courses/new', icon: PlusCircle },
    { label: 'Students', href: '/instructor/students', icon: Users },
    { label: 'Profile & KYC', href: '/instructor/profile', icon: Settings },
  ];

  const mentorLinks = [
    { label: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { label: 'Set Availability', href: '/mentor/availability', icon: Calendar },
    { label: 'Session Bookings', href: '/mentor/bookings', icon: BookOpen },
    { label: 'Profile & KYC', href: '/mentor/profile', icon: Settings },
  ];

  const organizationLinks = [
    { label: 'Dashboard', href: '/organization/dashboard', icon: LayoutDashboard },
    { label: 'Instructors', href: '/organization/instructors', icon: Users },
    { label: 'Courses', href: '/organization/courses', icon: BookOpen },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'KYC Verifications', href: '/admin/verifications', icon: ShieldCheck },
    { label: 'Course Approvals', href: '/admin/courses', icon: BookOpen },
    { label: 'Transactions', href: '/admin/payments', icon: CreditCard },
    { label: 'Reports & Flagged', href: '/admin/reports', icon: FileText },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const links =
    role === 'STUDENT'
      ? studentLinks
      : role === 'INSTRUCTOR'
      ? instructorLinks
      : role === 'MENTOR'
      ? mentorLinks
      : role === 'ORGANIZATION'
      ? organizationLinks
      : role === 'SUPER_ADMIN'
      ? adminLinks
      : [];

  const handleLinkClick = () => {
    // On mobile screens, auto-close drawer after clicking navigation item
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {role.replace('_', ' ')} MENU
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200/60 dark:border-brand-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 mt-6">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">Role Portal</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Logged in as <span className="font-bold text-brand-700 dark:text-brand-400 capitalize">{role.toLowerCase().replace('_', ' ')}</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-4rem)] shrink-0">
        {navContent}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 shadow-2xl z-50 flex flex-col transform transition-transform animate-slide-right">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
