import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { FcmProvider } from './providers/fcm.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [NotificationsService, FcmProvider],
  exports: [NotificationsService, FcmProvider],
})
export class NotificationsModule {}