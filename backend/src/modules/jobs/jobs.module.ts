import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderQueue } from './queues/order.queue';
import { OrderProcessor } from './processors/order.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) => {
            if (times > 3) {
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 1000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'order-queue',
    }),
    PrismaModule,
    EmailModule,
  ],
  providers: [OrderQueue, OrderProcessor],
  exports: [OrderQueue, BullModule],
})
export class JobsModule {}