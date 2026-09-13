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

    // 1. Create Order
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
    });

    if (paymentResult.success) {
      // Update Order & Record Payment
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

      // Notification
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
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
