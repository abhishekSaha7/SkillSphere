import { db } from '@/lib/db';
import { ShieldCheck, FileText, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KYCApprovalButtons } from './KYCApprovalButtons';

export const revalidate = 0;

export default async function AdminVerificationsPage() {
  const kycDocs = await db.kYCDocument.findMany({
    include: { user: true },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Instructor & Mentor KYC Verifications</h1>
        <p className="text-xs text-slate-500 mt-1">Review identity credentials, university degrees, and professional certifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted KYC Documents ({kycDocs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {kycDocs.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-xs">No verification documents submitted yet.</p>
          ) : (
            kycDocs.map((doc) => (
              <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{doc.user.name}</h3>
                    <Badge variant={doc.status === 'APPROVED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'}>
                      {doc.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">Document Type: {doc.documentType} • Role: {doc.user.role}</p>
                  <p className="text-xs text-brand-600 font-medium">Ref: {doc.fileUrl}</p>
                </div>

                <div className="flex items-center gap-2">
                  <KYCApprovalButtons kycId={doc.id} currentStatus={doc.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
