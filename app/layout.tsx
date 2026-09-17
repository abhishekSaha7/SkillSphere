import './globals.css';
import type { Metadata } from 'next';
import SessionProvider from '@/providers/SessionProvider';
import QueryProvider from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'SkillSphere — Educational Learning & Mentorship Marketplace',
  description: 'Connect with expert instructors, book top tech mentors, enroll in accredited courses, and buy professional study materials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Navbar />
              <div className="flex-1 flex max-w-7xl w-full mx-auto">
                <Sidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
                  {children}
                </main>
              </div>
              <Footer />
              <ToastContainer />
              <Toaster position="bottom-right" toastOptions={{ className: 'dark:bg-slate-900 dark:text-white border dark:border-slate-800' }} />
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
