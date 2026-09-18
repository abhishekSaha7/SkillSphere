import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required Razorpay verification payload.' }, { status: 400 });
    }

    // 1. Verify HMAC SHA256 Signature
    const isValid = PaymentService.verifyRazorpaySignature({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Razorpay payment signature verification failed.' }, { status: 400 });
    }

    // 2. Fetch existing Order
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // 3. Mark Order COMPLETED & Create Payment Entry
    await db.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        provider: 'RAZORPAY',
        status: 'COMPLETED',
        transactionId: razorpayPaymentId,
      },
    });

    // 4. Create Notification
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'Razorpay Payment Successful!',
        message: `Your payment of $${order.totalAmount.toFixed(2)} for Order #${order.id.substring(0, 8)} was verified.`,
        link: '/marketplace/cart',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified successfully!',
      orderId: order.id,
      transactionId: razorpayPaymentId,
    });
  } catch (error: any) {
    console.error('[Razorpay Verify Error]', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
