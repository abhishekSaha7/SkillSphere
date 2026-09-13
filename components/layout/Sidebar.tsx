'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Award,
  FileCheck,
  CreditCard,
  BarChart3,
  Settings,
  MessageSquare,
  FileText,
  ShieldCheck,
  PlusCircle,
  ShoppingBag,
  Bell,
  CheckSquare,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen } = useUIStore();

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
    { label: 'Assessments', href: '/instructor/assessments', icon: CheckSquare },
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

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role.replace('_', ' ')} MENU
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold border border-brand-200/60'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mt-6">
        <p className="text-xs font-semibold text-slate-900">Role Mode</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Logged in as <span className="font-bold text-brand-700 capitalize">{role.toLowerCase().replace('_', ' ')}</span></p>
      </div>
    </aside>
  );
}
