/**
 * Payment Service Abstraction
 * 
 * Supports local Mock payments, easily expandable to Stripe, Razorpay, or PayPal.
 */

export interface ProcessPaymentInput {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  provider: 'MOCK' | 'STRIPE' | 'RAZORPAY';
  receiptUrl?: string;
  message?: string;
}

export class PaymentService {
  private static provider = process.env.PAYMENT_PROVIDER || 'MOCK';

  /**
   * Processes a payment transaction
   */
  static async processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
    if (this.provider === 'STRIPE') {
      // Future Stripe integration placeholder
      throw new Error('Stripe provider not yet configured. Set PAYMENT_PROVIDER=MOCK.');
    }

    if (this.provider === 'RAZORPAY') {
      // Future Razorpay integration placeholder
      throw new Error('Razorpay provider not yet configured. Set PAYMENT_PROVIDER=MOCK.');
    }

    // Mock Payment Processor for zero-credential development
    const mockTransactionId = `txn_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`[PaymentService MOCK] Processed payment of $${input.amount} for Order ${input.orderId}`);

    return {
      success: true,
      transactionId: mockTransactionId,
      status: 'COMPLETED',
      provider: 'MOCK',
      receiptUrl: `/receipts/${mockTransactionId}`,
      message: 'Mock payment processed successfully without real cards.',
    };
  }

  /**
   * Processes a refund request
   */
  static async refundPayment(transactionId: string, amount: number): Promise<boolean> {
    console.log(`[PaymentService MOCK] Refunded $${amount} for Transaction ${transactionId}`);
    return true;
  }
}
