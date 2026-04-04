import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { UPIProvider } from './providers/upi.provider';
import { CODProvider } from './providers/cod.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrdersModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, RazorpayProvider, UPIProvider, CODProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}