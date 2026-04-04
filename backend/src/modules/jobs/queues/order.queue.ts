import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface OrderJobData {
  orderId: number;
  userId: number;
  userEmail: string;
  orderTotal: number;
  orderStatus: string;
  type: 'order-created' | 'order-shipped' | 'order-delivered' | 'order-cancelled';
}

@Injectable()
export class OrderQueue {
  private readonly logger = new Logger(OrderQueue.name);

  constructor(
    @InjectQueue('order-queue')
    private readonly queue: Queue<OrderJobData>,
  ) {}

  async addOrderNotification(data: OrderJobData) {
    try {
      const job = await this.queue.add('send-order-notification', data, {
        priority: data.type === 'order-created' ? 1 : 2,
        delay: data.type === 'order-shipped' ? 5000 : 0,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      });
      this.logger.log(`Order notification job added: ${job.id}`);
      return job;
    } catch (error: any) {
      this.logger.error(`Failed to add order notification job: ${error.message}`);
      throw error;
    }
  }

  async addOrderEmail(data: OrderJobData) {
    try {
      const job = await this.queue.add('send-order-email', data, {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      });
      this.logger.log(`Order email job added: ${job.id}`);
      return job;
    } catch (error: any) {
      this.logger.error(`Failed to add order email job: ${error.message}`);
      throw error;
    }
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);
    return {
      waiting,
      active,
      completed,
      failed,
    };
  }

  async clearQueue() {
    await this.queue.obliterate({ force: true });
    this.logger.log('Order queue cleared');
  }
}