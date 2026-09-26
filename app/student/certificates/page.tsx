import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Award, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function StudentCertificatesPage() {
  const session = await getServerSession(authOptions);

  const certificates = await db.certificate.findMany({
    where: { userId: session?.user?.id },
    include: {
      course: { include: { instructor: true } },
      user: true,
    },
    orderBy: { issuedAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Certificates</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Accredited certificates automatically issued upon 100% course completion.
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 dark:text-slate-400 border-dashed dark:border-slate-800">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">No certificates earned yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Complete all modules and lessons in an enrolled course to generate your official certificate.
          </p>
          <Link href="/student/courses">
            <Button size="sm" className="mt-4">
              Continue Learning
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-2 border-brand-200/80 dark:border-brand-900/60 shadow-md relative overflow-hidden bg-gradient-to-br from-white via-brand-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Certificate
                  </Badge>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">ID: {cert.certificateCode.substring(0, 8)}</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">SkillSphere Accreditation</p>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight">{cert.course.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Issued to <strong className="text-slate-900 dark:text-white">{cert.user.name}</strong></p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</span>
                  <Link href={`/certificates/verify/${cert.certificateCode}`} target="_blank">
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      Download & Verify <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
