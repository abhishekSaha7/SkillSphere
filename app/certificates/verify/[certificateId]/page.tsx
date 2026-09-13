import Link from 'next/link';
import { db } from '@/lib/db';
import { GraduationCap, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const revalidate = 0;

export default async function CertificateVerificationPage({ params }: { params: { certificateId: string } }) {
  const certificate = await db.certificate.findFirst({
    where: {
      OR: [
        { id: params.certificateId },
        { certificateCode: params.certificateId },
      ],
    },
    include: {
      user: true,
      course: { include: { instructor: true } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto my-8 px-4 space-y-6">
      <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to SkillSphere Home
      </Link>

      {certificate ? (
        <Card className="border-2 border-emerald-500/50 shadow-2xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <Badge variant="success" className="bg-emerald-950 text-emerald-300 border-emerald-800 mx-auto px-3 py-1 mb-2">
              VERIFIED CERTIFICATE
            </Badge>
            <CardTitle className="text-2xl font-bold text-white">SkillSphere Certificate of Completion</CardTitle>
            <p className="text-xs text-slate-300 mt-1">Official Verification Record</p>
          </CardHeader>

          <CardContent className="p-8 space-y-6 text-center">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">This certifies that</p>
              <h2 className="text-2xl font-extrabold text-slate-900">{certificate.user.name}</h2>
              <p className="text-xs text-slate-500">({certificate.user.email})</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Has successfully completed</p>
              <h3 className="text-lg font-bold text-brand-700">{certificate.course.title}</h3>
              <p className="text-xs text-slate-600">Category: {certificate.course.category} • Level: {certificate.course.level}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-left bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400 font-semibold block">Instructor</span>
                <span className="font-bold text-slate-800">{certificate.course.instructor.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Date Issued</span>
                <span className="font-bold text-slate-800">{new Date(certificate.issuedAt).toLocaleDateString()}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block">Certificate Verification Code</span>
                <code className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-800 select-all font-bold">
                  {certificate.certificateCode}
                </code>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              This record confirms that the above individual has fulfilled 100% of required coursework and assessments on the SkillSphere Learning Platform.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-200 shadow-xl text-center p-8">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Certificate Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The certificate ID &quot;{params.certificateId}&quot; could not be verified in the SkillSphere database. Please verify the code or link and try again.
          </p>
          <Link href="/courses">
            <Button size="sm" className="mt-4">
              Explore SkillSphere Courses
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
