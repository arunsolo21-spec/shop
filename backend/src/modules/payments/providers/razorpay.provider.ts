import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayProvider {
  private readonly logger = new Logger(RazorpayProvider.name);
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.error('Razorpay credentials not configured');
      throw new Error('Razorpay credentials not configured');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    this.logger.log('Razorpay provider initialized');
  }

  getInstance(): Razorpay {
    return this.razorpay;
  }

  async createOrder(amount: number, receipt: string, currency: string = 'INR') {
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        source: 'freshmart_app',
        region: 'tamil_nadu',
      },
    };

    return await this.razorpay.orders.create(options);
  }

  async verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<boolean> {
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET'))
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature),
    );

    if (!isValid) {
      this.logger.warn(`Invalid payment signature for order ${razorpayOrderId}`);
    }

    return isValid;
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('Razorpay webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature),
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
    }

    return isValid;
  }

  async fetchPaymentDetails(paymentId: string) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  async refundPayment(paymentId: string, amount?: number, notes?: Record<string, string>) {
    try {
      const refund = await (this.razorpay.refunds as any).create({
        payment_id: paymentId,
        amount: amount,
        notes: notes || {},
      });

      this.logger.log(`Refund created for payment ${paymentId}: ${refund.id}`);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (error: any) {
      this.logger.error(`Refund failed for payment ${paymentId}: ${error.message}`);
      throw error;
    }
  }

  async capturePayment(captureId: string, amount: number, currency: string = 'INR') {
    try {
      const payment = await this.razorpay.payments.capture(captureId, amount, currency);

      this.logger.log(`Payment captured: ${captureId}`);

      return {
        success: true,
        paymentId: payment.id,
        amount: payment.amount,
        status: payment.status,
      };
    } catch (error: any) {
      this.logger.error(`Payment capture failed: ${error.message}`);
      throw error;
    }
  }
}