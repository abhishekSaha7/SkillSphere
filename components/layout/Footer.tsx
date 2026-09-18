import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">SkillSphere</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering global professionals and students with industry-grade courses, 1-on-1 mentorship, and accredited certifications.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/courses" className="hover:text-white transition-colors">Course Marketplace</Link></li>
              <li><Link href="/mentors" className="hover:text-white transition-colors">1-on-1 Mentorship</Link></li>
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Digital Study Products</Link></li>
              <li><Link href="/discussions" className="hover:text-white transition-colors">Community Forum</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Roles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register" className="hover:text-white transition-colors">For Students</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Become an Instructor</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Become a Mentor</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Training Organizations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Verification</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/certificates/verify/demo-code-123" className="hover:text-white transition-colors">Certificate Verification</Link></li>
              <li><span className="text-slate-500">Security & Privacy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SkillSphere Platform. All rights reserved. Educational Architecture.
        </div>
      </div>
    </footer>
  );
}
