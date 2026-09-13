import { db } from '@/lib/db';
import { CreditCard, DollarSign, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const payments = await db.payment.findMany({
    include: {
      order: {
        include: {
          user: true,
          items: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Payments & Transactions</h1>
        <p className="text-xs text-slate-500 mt-1">Audit order histories, payment gateway logs, and processed receipts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completed Transactions ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-800">{p.transactionId.substring(0, 16)}</td>
                  <td className="p-4 font-semibold text-slate-900">{p.order.user.name}</td>
                  <td className="p-4 font-extrabold text-slate-900">${p.amount.toFixed(2)}</td>
                  <td className="p-4"><Badge variant="info">{p.provider}</Badge></td>
                  <td className="p-4"><Badge variant="success">{p.status}</Badge></td>
                  <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
