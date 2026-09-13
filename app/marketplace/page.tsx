import Link from 'next/link';
import { db } from '@/lib/db';
import { ShoppingBag, FileText, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AddToCartButton } from './AddToCartButton';

export const revalidate = 0;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  const type = searchParams?.type || 'ALL';

  const where: any = {};
  if (type !== 'ALL') where.productType = type;

  const products = await db.product.findMany({
    where,
    include: { seller: true },
    orderBy: { createdAt: 'desc' },
  });

  const types = ['ALL', 'EBOOK', 'PRACTICE_TEST', 'STUDY_MATERIAL', 'TEMPLATE', 'INTERVIEW_PACKAGE'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <Badge variant="info" className="bg-brand-950 text-brand-300 border-brand-800">
            Digital Products Marketplace
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">E-books, Study Materials & Practice Test Packs</h1>
          <p className="text-sm text-slate-300">
            Download curated technical interview handbooks, certification practice exams, and system templates.
          </p>
        </div>
        <Link href="/marketplace/cart">
          <Button className="bg-brand-500 hover:bg-brand-600 font-bold shrink-0">
            <ShoppingBag className="w-4 h-4 mr-2" /> View Shopping Cart
          </Button>
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <Link key={t} href={`/marketplace?type=${t}`}>
            <Badge
              variant={type === t ? 'info' : 'outline'}
              className="px-3.5 py-1.5 cursor-pointer text-xs uppercase tracking-wider font-semibold"
            >
              {t.replace('_', ' ')}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((prod) => (
          <Card key={prod.id} className="p-6 flex flex-col justify-between hover:shadow-lg transition-all space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="info">{prod.productType.replace('_', ' ')}</Badge>
                <span className="text-xl font-extrabold text-slate-900">${prod.price.toFixed(2)}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-lg leading-snug">{prod.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{prod.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">By <strong className="text-slate-700">{prod.seller.name}</strong></span>
              <AddToCartButton product={prod} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
