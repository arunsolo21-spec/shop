import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { UPIProvider } from './providers/upi.provider';
import { OrdersService } from '../orders/orders.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private razorpayProvider: RazorpayProvider,
    private upiProvider: UPIProvider,
    private ordersService: OrdersService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async initiatePayment(userId: number, orderId: number, paymentMethod: string) {
    this.logger.log(`Initiating ${paymentMethod} payment for order ${orderId} by user ${userId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found or unauthorized');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order cannot be paid at this stage');
    }

    const amount = order.totalAmount;

    if (paymentMethod === 'COD') {
      return await this.initiateCODPayment(userId, orderId, amount);
    } else if (paymentMethod === 'UPI' || paymentMethod === 'ONLINE') {
      return await this.initiateUPIPayment(userId, orderId, amount);
    } else {
      throw new BadRequestException('Invalid payment method');
    }
  }

  async initiateCODPayment(userId: number, orderId: number, amount: number) {
    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: 'COD',
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      this.logger.log(`COD payment initiated for order ${orderId}`);

      return {
        success: true,
        data: {
          paymentMethod: 'COD',
          amount: amount,
          message: 'Cash on Delivery selected. Pay when you receive your order.',
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to initiate COD payment: ${error.message}`);
      throw new InternalServerErrorException('COD payment initiation failed');
    }
  }

  async initiateUPIPayment(userId: number, orderId: number, amount: number) {
    try {
      const upiOrder = await this.upiProvider.createUPIOrder(amount, userId, orderId);

      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: 'UPI',
          paymentId: upiOrder.data.orderId,
          paymentStatus: PaymentStatus.PENDING,
        },
      });

      this.logger.log(`UPI payment initiated for order ${orderId}`);

      return {
        success: true,
        data: {
          ...upiOrder.data,
          message: 'UPI payment initiated. Complete payment in your UPI app.',
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to initiate UPI payment: ${error.message}`);
      throw new InternalServerErrorException('UPI payment initiation failed');
    }
  }

  async verifyPayment(
    userId: number,
    orderId: number,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ) {
    this.logger.log(`Verifying payment for order ${orderId}`);

    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } }, user: true, address: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found or unauthorized');
    }

    if (order.paymentId !== razorpayOrderId) {
      throw new BadRequestException('Payment ID mismatch');
    }

    const verificationResult = await this.upiProvider.verifyUPIPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!verificationResult.success) {
      throw new BadRequestException(verificationResult.message);
    }

    const paymentDetails = verificationResult.data;
    const expectedAmount = Math.round(order.totalAmount * 100);

    if (paymentDetails.amount !== expectedAmount) {
      this.logger.error(
        `Amount mismatch: expected ${expectedAmount}, got ${paymentDetails.amount}`,
      );
      throw new BadRequestException('Payment amount mismatch');
    }

    return await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.SUCCESS,
          paymentId: razorpayPaymentId,
          paymentSignature: razorpaySignature,
          paymentMethod: order.paymentMethod || 'UPI',
        },
        include: {
          items: { include: { product: true } },
          user: true,
          address: true,
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      if (order.user.email) {
        await this.emailService.sendOrderConfirmation(
          order.user.email,
          order.orderId,
          order.totalAmount,
        );
      }

      this.logger.log(`Payment verified and order ${orderId} confirmed`);

      return {
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: updatedOrder.orderId,
          status: updatedOrder.status,
          paymentId: razorpayPaymentId,
          amount: order.totalAmount,
        },
      };
    });
  }

  async handleWebhook(payload: any, signature: string) {
    this.logger.log('Processing Razorpay webhook');

    const isValid = await this.razorpayProvider.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload.event;
    const payment = payload.payload.payment.entity;

    if (event === 'payment.captured') {
      const order = await this.prisma.order.findFirst({
        where: { paymentId: payment.order_id },
      });

      if (order && order.status === OrderStatus.PENDING) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CONFIRMED,
            paymentStatus: PaymentStatus.SUCCESS,
          },
        });

        this.logger.log(`Webhook: Order ${order.orderId} confirmed`);
      }
    }

    if (event === 'payment.failed') {
      const order = await this.prisma.order.findFirst({
        where: { paymentId: payment.order_id },
      });

      if (order && order.status === OrderStatus.PENDING) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });

        this.logger.log(`Webhook: Order ${order.orderId} payment failed`);
      }
    }

    return { success: true };
  }

  async getPaymentStatus(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      select: {
        id: true,
        orderId: true,
        status: true,
        paymentMethod: true,
        paymentId: true,
        paymentStatus: true,
        totalAmount: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    let paymentDetails = null;

    if (order.paymentId && order.paymentMethod === 'UPI') {
      try {
        paymentDetails = await this.razorpayProvider.fetchPaymentDetails(order.paymentId);
      } catch (error) {
        this.logger.warn(`Could not fetch payment details: ${error.message}`);
      }
    }

    return {
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        paymentStatus: order.paymentStatus,
        amount: order.totalAmount,
        paymentDetails: paymentDetails?.status || null,
      },
    };
  }

  async processCODOnDelivery(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentMethod !== 'COD') {
      throw new BadRequestException('Order is not COD');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.SUCCESS,
      },
    });

    this.logger.log(`COD payment marked as successful for order ${orderId}`);

    return {
      success: true,
      message: 'COD payment recorded successfully',
    };
  }

  async getUPIApps() {
    return {
      success: true,
      data: this.upiProvider.getUPIApps(),
    };
  }
}