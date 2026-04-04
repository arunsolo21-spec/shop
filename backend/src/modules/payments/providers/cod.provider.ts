import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CODProvider {
  private readonly logger = new Logger(CODProvider.name);

  async createCODOrder(amount: number, userId: number, orderId: number) {
    this.logger.log(`Creating COD order for user ${userId}, amount: ${amount}`);
    
    return {
      id: `COD_${orderId}_${Date.now()}`,
      amount,
      currency: 'INR',
      paymentMethod: 'COD',
      status: 'pending',
      createdAt: new Date(),
    };
  }

  async verifyCODPayment(orderId: string, userId: number) {
    this.logger.log(`Verifying COD payment for order ${orderId}`);
    
    return {
      success: true,
      message: 'COD payment verified - Cash on Delivery',
      paymentMethod: 'COD',
    };
  }

  async handleCODWebhook(payload: any) {
    this.logger.log('COD webhook received (no action needed)');
    return { success: true };
  }
}