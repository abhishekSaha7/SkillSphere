import { db } from '@/lib/db';
import { ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KYCApprovalButtons } from './KYCApprovalButtons';

export const revalidate = 0;

export default async function AdminVerificationsPage() {
  const kycDocs = await db.kYCDocument.findMany({
    include: {
      user: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Instructor & Mentor KYC Verifications</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review identity credentials, university degrees, and professional certifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Submitted KYC Documents ({kycDocs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {kycDocs.length === 0 ? (
            <p className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">No verification documents submitted yet.</p>
          ) : (
            kycDocs.map((doc) => (
              <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{doc.user.name || 'Anonymous User'}</h3>
                    <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'}>
                      {doc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Document Type: <span className="font-medium text-slate-700 dark:text-slate-300">{doc.documentType}</span> • Role: <span className="font-medium text-slate-700 dark:text-slate-300">{doc.user.role}</span>
                  </p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate max-w-md">
                    Ref: {doc.fileUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <KYCApprovalButtons doc={JSON.parse(JSON.stringify(doc))} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

