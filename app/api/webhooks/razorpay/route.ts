import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
    }

    const isValid = PaymentService.verifyRazorpayWebhook(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.notes?.orderId;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;

      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        });

        const existingPayment = await db.payment.findFirst({
          where: { transactionId: paymentId },
        });

        if (!existingPayment) {
          await db.payment.create({
            data: {
              orderId,
              amount,
              provider: 'RAZORPAY',
              status: 'COMPLETED',
              transactionId: paymentId,
            },
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.notes?.orderId;

      if (orderId) {
        await db.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[Razorpay Webhook Error]', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
