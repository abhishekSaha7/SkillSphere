import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to complete checkout.' }, { status: 401 });
    }

    const { items } = await req.json(); // Array of { id, price }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.price, 0);

    // 1. Create Order in Database (PENDING status)
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            price: item.price,
          })),
        },
      },
    });

    // 2. Execute Payment via PaymentService Abstraction
    const paymentResult = await PaymentService.processPayment({
      orderId: order.id,
      amount: totalAmount,
      userEmail: session.user.email || undefined,
      userName: session.user.name || undefined,
    });

    // If Razorpay requires client popup modal execution
    if (paymentResult.requiresRazorpayModal) {
      return NextResponse.json({
        requiresRazorpayModal: true,
        orderId: order.id,
        razorpayOrderId: paymentResult.razorpayOrderId,
        amountInPaise: paymentResult.amountInPaise,
        currency: paymentResult.currency,
        keyId: paymentResult.keyId,
      });
    }

    if (paymentResult.success) {
      // Mock payment completed immediately
      await db.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' },
      });

      await db.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          provider: paymentResult.provider,
          status: 'COMPLETED',
          transactionId: paymentResult.transactionId,
        },
      });

      await db.notification.create({
        data: {
          userId: session.user.id,
          title: 'Order Completed!',
          message: `Your order #${order.id.substring(0, 8)} has been processed. Download files now.`,
          link: '/marketplace/cart',
        },
      });

      return NextResponse.json({
        message: 'Order completed successfully!',
        orderId: order.id,
        transactionId: paymentResult.transactionId,
        receiptUrl: paymentResult.receiptUrl,
      });
    } else {
      return NextResponse.json({ error: 'Payment processing failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Orders API Error]', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
