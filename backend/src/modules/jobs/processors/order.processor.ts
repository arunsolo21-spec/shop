import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { OrderJobData } from '../queues/order.queue';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';

@Processor('order-queue')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Process('send-order-notification')
  async handleOrderNotification(job: Job<OrderJobData>) {
    try {
      this.logger.log(`Processing order notification: ${job.data.orderId}`);
      const { orderId, userId, userEmail, orderTotal, orderStatus, type } = job.data;

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found for notification`);
        return { success: false, message: 'Order not found' };
      }

      let emailSent = false;

      if (type === 'order-created') {
        emailSent = await this.emailService.sendOrderConfirmation(
          userEmail,
          order.orderId,
          orderTotal,
        );
      } else {
        emailSent = await this.emailService.sendOrderNotification(
          userEmail,
          order.orderId,
          orderStatus,
          orderTotal,
          type,
        );
      }

      if (emailSent) {
        this.logger.log(`Order notification sent for order ${orderId}`);
        return { success: true, orderId };
      } else {
        this.logger.warn(`Failed to send order notification for order ${orderId}`);
        return { success: false, message: 'Email send failed' };
      }
    } catch (error: any) {
      this.logger.error(`Order notification processing failed: ${error.message}`);
      throw error;
    }
  }

  @Process('send-order-email')
  async handleOrderEmail(job: Job<OrderJobData>) {
    try {
      this.logger.log(`Processing order email: ${job.data.orderId}`);
      const { orderId, userEmail, orderTotal } = job.data;

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found for email`);
        return { success: false, message: 'Order not found' };
      }

      const emailSent = await this.emailService.sendOrderConfirmation(
        userEmail,
        order.orderId,
        orderTotal,
      );

      if (emailSent) {
        this.logger.log(`Order confirmation email sent for order ${orderId}`);
        return { success: true, orderId };
      } else {
        this.logger.warn(`Failed to send order confirmation email for order ${orderId}`);
        return { success: false, message: 'Email send failed' };
      }
    } catch (error: any) {
      this.logger.error(`Order email processing failed: ${error.message}`);
      throw error;
    }
  }
}