import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { RazorpayProvider } from './razorpay.provider';

@Injectable()
export class UPIProvider {
  private readonly logger = new Logger(UPIProvider.name);
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private razorpayProvider: RazorpayProvider,
  ) {
    this.razorpay = this.razorpayProvider.getInstance();
  }

  async createUPIOrder(amount: number, userId: number, orderId: number) {
    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `ORDER_${orderId}_${userId}`,
        payment_capture: true,
        notes: {
          userId: userId.toString(),
          orderId: orderId.toString(),
          paymentType: 'UPI',
        },
      });

      this.logger.log(`UPI order created: ${razorpayOrder.id}`);

      return {
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: this.configService.get('RAZORPAY_KEY_ID'),
          userId,
          internalOrderId: orderId,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to create UPI order: ${error.message}`);
      throw error;
    }
  }

  async verifyUPIPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    try {
      const isValid = await this.razorpayProvider.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      );

      if (!isValid) {
        this.logger.error(`Invalid UPI payment signature: ${razorpayPaymentId}`);
        return {
          success: false,
          message: 'Invalid payment signature',
        };
      }

      const paymentDetails = await this.razorpayProvider.fetchPaymentDetails(razorpayPaymentId);

      if (paymentDetails.status !== 'captured') {
        this.logger.error(`UPI payment not captured: ${razorpayPaymentId}`);
        return {
          success: false,
          message: 'Payment not captured',
        };
      }

      this.logger.log(`UPI payment verified: ${razorpayPaymentId}`);

      return {
        success: true,
        data: {
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId,
          amount: paymentDetails.amount,
          status: paymentDetails.status,
          method: paymentDetails.method,
          upiId: paymentDetails.vpa,
          bank: paymentDetails.bank,
          wallet: paymentDetails.wallet,
        },
      };
    } catch (error: any) {
      this.logger.error(`UPI payment verification failed: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  getUPIApps() {
    return [
      {
        id: 'gpay',
        name: 'Google Pay',
        icon: 'assets/icons/gpay.png',
        packageName: 'com.google.android.apps.nbu.paisa.user',
        urlScheme: 'tez://',
        isPopular: true,
      },
      {
        id: 'phonepe',
        name: 'PhonePe',
        icon: 'assets/icons/phonepe.png',
        packageName: 'com.phonepe.app',
        urlScheme: 'phonepe://',
        isPopular: true,
      },
      {
        id: 'paytm',
        name: 'Paytm',
        icon: 'assets/icons/paytm.png',
        packageName: 'net.one97.paytm',
        urlScheme: 'paytmmp://',
        isPopular: true,
      },
      {
        id: 'bhim',
        name: 'BHIM UPI',
        icon: 'assets/icons/bhim.png',
        packageName: 'in.org.npci.upiapp',
        urlScheme: 'bhimupi://',
        isPopular: false,
      },
      {
        id: 'other',
        name: 'Other UPI Apps',
        icon: 'assets/icons/other_upi.png',
        packageName: null,
        urlScheme: null,
        isPopular: false,
      },
    ];
  }
}