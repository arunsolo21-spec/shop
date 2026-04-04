import { Injectable, Logger } from '@nestjs/common';
import { FcmProvider } from './providers/fcm.provider';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: 'order' | 'promotion' | 'system' | 'payment';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly fcmProvider: FcmProvider,
    private readonly prisma: PrismaService,
  ) {}

  async sendToUser(payload: NotificationPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          deviceTokens: true,
        },
      });
      if (!user) {
        this.logger.warn(`User ${payload.userId} not found for notification`);
        return { success: false, message: 'User not found' };
      }
      const deviceTokens = user.deviceTokens || [];
      if (deviceTokens.length === 0) {
        this.logger.warn(`User ${payload.userId} has no registered devices`);
        return { success: false, message: 'No devices registered' };
      }
      const notification = {
        title: payload.title,
        body: payload.body,
        data: {
          ...payload.data,
          type: payload.type || 'system',
          userId: payload.userId.toString(),
          timestamp: new Date().toISOString(),
        },
      };
      const results = await Promise.all(
        deviceTokens.map((token) =>
          this.fcmProvider.sendToDevice(token, notification),
        ),
      );
      const successCount = results.filter((r) => r.success).length;
      this.logger.log(
        `Notification sent to ${successCount}/${deviceTokens.length} devices for user ${payload.userId}`,
      );
      await this.saveNotificationToDatabase(payload.userId, payload, successCount > 0);
      return {
        success: successCount > 0,
        sentTo: successCount,
        total: deviceTokens.length,
      };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async sendToTopic(topic: string, payload: Omit<NotificationPayload, 'userId'>) {
    try {
      const notification = {
        title: payload.title,
        body: payload.body,
        data: {
          ...payload.data,
          type: payload.type || 'system',
          timestamp: new Date().toISOString(),
        },
      };
      const result = await this.fcmProvider.sendToTopic(topic, notification);
      this.logger.log(`Notification sent to topic ${topic}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send topic notification: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async registerDeviceToken(userId: number, deviceToken: string, deviceType: 'ios' | 'android') {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const deviceTokens = user.deviceTokens || [];
      if (!deviceTokens.includes(deviceToken)) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            deviceTokens: {
              push: deviceToken,
            },
          },
        });
        this.logger.log(`Device token registered for user ${userId}`);
      }
      return { success: true, message: 'Device token registered' };
    } catch (error) {
      this.logger.error(`Failed to register device token: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async unregisterDeviceToken(userId: number, deviceToken: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      const deviceTokens = (user.deviceTokens || []).filter(
        (token) => token !== deviceToken,
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: { deviceTokens },
      });
      this.logger.log(`Device token unregistered for user ${userId}`);
      return { success: true, message: 'Device token unregistered' };
    } catch (error) {
      this.logger.error(`Failed to unregister device token: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  private async saveNotificationToDatabase(
    userId: number,
    payload: NotificationPayload,
    delivered: boolean,
  ) {
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          title: payload.title,
          body: payload.body,
          type: payload.type || 'system',
          data: payload.data || {},
          isRead: false,
          deliveredAt: delivered ? new Date() : null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to save notification to database: ${error.message}`);
    }
  }
}