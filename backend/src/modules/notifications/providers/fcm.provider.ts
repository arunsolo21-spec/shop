import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface FcmNotification {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  clickAction?: string;
}

@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
      if (!serviceAccount) {
        this.logger.warn('Firebase service account not configured. FCM disabled.');
        return;
      }
      const serviceAccountJson = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });
      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
      this.isInitialized = false;
    }
  }

  async sendToDevice(deviceToken: string, notification: FcmNotification) {
    if (!this.isInitialized) {
      this.logger.warn('FCM not initialized. Skipping notification.');
      return { success: false, message: 'FCM not initialized' };
    }
    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            clickAction: notification.clickAction || 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };
      const response = await admin.messaging().send(message);
      this.logger.log(`FCM message sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      if (error.code === 'messaging/invalid-registration-token') {
        this.logger.warn(`Invalid device token: ${deviceToken}`);
        return { success: false, message: 'Invalid device token', shouldRemove: true };
      }
      this.logger.error(`FCM send failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async sendToTopic(topic: string, notification: FcmNotification) {
    if (!this.isInitialized) {
      this.logger.warn('FCM not initialized. Skipping topic notification.');
      return { success: false, message: 'FCM not initialized' };
    }
    try {
      const message: admin.messaging.Message = {
        topic: topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };
      const response = await admin.messaging().send(message);
      this.logger.log(`FCM topic message sent successfully: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      this.logger.error(`FCM topic send failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async sendMulticast(deviceTokens: string[], notification: FcmNotification) {
    if (!this.isInitialized) {
      this.logger.warn('FCM not initialized. Skipping multicast.');
      return { success: false, message: 'FCM not initialized' };
    }
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `FCM multicast sent: ${response.successCount}/${deviceTokens.length} successful`,
      );
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error: any) {
      this.logger.error(`FCM multicast failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string) {
    if (!this.isInitialized) {
      return { success: false, message: 'FCM not initialized' };
    }
    try {
      await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
      this.logger.log(`Device unsubscribed from topic ${topic}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to unsubscribe from topic: ${error.message}`);
      return { success: false, message: error.message };
    }
  }
}