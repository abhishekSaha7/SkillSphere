'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Trash2, ArrowLeft, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeItem, clearCart, totalAmount } = useCartStore();
  const { addToast } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const handleCheckout = async () => {
    if (!session) {
      router.push('/login?callbackUrl=/marketplace/cart');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      addToast({
        type: 'success',
        title: 'Mock Payment Successful!',
        message: 'Order created without requiring real credit cards.',
      });

      setCompletedOrder({
        orderId: data.orderId,
        transactionId: data.transactionId,
        items: [...items],
      });

      clearCart();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Checkout Error', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 my-8">
        <Card className="border-2 border-emerald-500 shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order Completed Successfully!</h1>
            <p className="text-xs text-slate-500 mt-1">Transaction ID: <code className="font-mono text-slate-800">{completedOrder.transactionId}</code></p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-left space-y-3 border border-slate-200">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Your Digital Downloads</h3>
            <div className="space-y-2">
              {completedOrder.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500">{item.productType}</p>
                  </div>
                  <a href={item.fileUrl || '#'} download className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          </div>

          <Link href="/marketplace">
            <Button variant="outline" className="w-full">
              Return to Marketplace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/marketplace" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-xs font-semibold text-rose-600 hover:underline">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border-dashed">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Your cart is currently empty</h3>
          <p className="text-xs text-slate-500 mt-1">Browse our digital store to add e-books, study materials, or practice exams.</p>
          <Link href="/marketplace">
            <Button size="sm" className="mt-4">
              Explore Products
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-[10px] text-slate-500">{item.productType.replace('_', ' ')}</p>
                  <p className="text-xs font-bold text-brand-600 mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-600 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>

          <div>
            <Card className="p-6 space-y-4 shadow-md">
              <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Order Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${totalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t">
                  <span>Total</span>
                  <span>${totalAmount().toFixed(2)} USD</span>
                </div>
              </div>

              <Button onClick={handleCheckout} isLoading={isLoading} className="w-full py-3 font-bold">
                Complete Mock Payment (${totalAmount().toFixed(2)})
              </Button>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Mock payment abstraction active
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
