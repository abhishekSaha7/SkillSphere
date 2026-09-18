/**
 * Payment Service Abstraction
 * 
 * Supports local Mock payments and full Razorpay integration (orders, signature verification, refunds).
 */
import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  userEmail?: string;
  userName?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  provider: 'MOCK' | 'STRIPE' | 'RAZORPAY';
  receiptUrl?: string;
  message?: string;
  // Razorpay client modal fields
  requiresRazorpayModal?: boolean;
  razorpayOrderId?: string;
  amountInPaise?: number;
  currency?: string;
  keyId?: string;
}

export interface RazorpayVerificationInput {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class PaymentService {
  private static provider = process.env.PAYMENT_PROVIDER || 'MOCK';

  private static getRazorpayInstance() {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !keySecret) {
      console.warn('[PaymentService] Razorpay key_id or key_secret missing in environment variables.');
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Processes or prepares a payment transaction
   */
  static async processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
    if (this.provider === 'STRIPE') {
      throw new Error('Stripe provider not yet configured. Set PAYMENT_PROVIDER=MOCK or RAZORPAY.');
    }

    if (this.provider === 'RAZORPAY') {
      const razorpayOrder = await this.createRazorpayOrder(input.orderId, input.amount, input.currency || 'INR');
      
      return {
        success: true,
        transactionId: razorpayOrder.id,
        status: 'PENDING',
        provider: 'RAZORPAY',
        requiresRazorpayModal: true,
        razorpayOrderId: razorpayOrder.id,
        amountInPaise: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
        message: 'Razorpay order created successfully. Awaiting client signature.',
      };
    }

    // Mock Payment Processor for zero-credential local development
    const mockTransactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`[PaymentService MOCK] Processed payment of $${input.amount} for Order ${input.orderId}`);

    return {
      success: true,
      transactionId: mockTransactionId,
      status: 'COMPLETED',
      provider: 'MOCK',
      receiptUrl: `/receipts/${mockTransactionId}`,
      message: 'Mock payment processed successfully.',
    };
  }

  /**
   * Creates a Razorpay Order on Razorpay Servers
   */
  static async createRazorpayOrder(orderId: string, amount: number, currency: string = 'INR') {
    const razorpay = this.getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // Amount in smallest currency unit (paise/cents)
      currency,
      receipt: orderId.substring(0, 40),
      notes: {
        orderId,
        platform: 'SkillSphere',
      },
    };

    try {
      const rzpOrder = await razorpay.orders.create(options as any);
      return rzpOrder as { id: string; amount: number; currency: string };
    } catch (err: any) {
      console.error('[PaymentService Razorpay Error]', err);
      throw new Error(`Razorpay order creation failed: ${err.message || err}`);
    }
  }

  /**
   * Verifies HMAC SHA256 signature returned by Razorpay Checkout Modal
   */
  static verifyRazorpaySignature(input: RazorpayVerificationInput): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[PaymentService] RAZORPAY_KEY_SECRET is not defined in env.');
      return false;
    }

    const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === input.razorpaySignature;
  }

  /**
   * Verifies Razorpay Webhook Signature
   */
  static verifyRazorpayWebhook(rawBody: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[PaymentService] RAZORPAY_WEBHOOK_SECRET is not defined in env.');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Processes a refund request
   */
  static async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    if (this.provider === 'RAZORPAY') {
      try {
        const razorpay = this.getRazorpayInstance();
        await razorpay.payments.refund(transactionId, {
          amount: Math.round(amount * 100),
        });
        return true;
      } catch (err: any) {
        console.error('[PaymentService Razorpay Refund Error]', err);
        return false;
      }
    }

    console.log(`[PaymentService MOCK] Refunded $${amount} for Transaction ${transactionId}`);
    return true;
  }
}
