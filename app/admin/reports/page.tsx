import { db } from '@/lib/db';
import { Flag, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    include: { reporter: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Community Moderation & Flagged Content</h1>
        <p className="text-xs text-slate-500 mt-1">Review reported discussions, comments, and inappropriate user activities.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Items ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-xs text-slate-500">
          {reports.length === 0 ? (
            <p>🎉 No pending content flags. Community is clean and active.</p>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="p-3 border-b text-left">
                <Badge variant="danger">{r.targetType}</Badge>
                <p className="font-bold text-slate-900 mt-1">Reason: {r.reason}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
