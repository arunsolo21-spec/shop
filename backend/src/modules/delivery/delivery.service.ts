import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async assignDeliveryPartner(orderId: number, partnerId: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      const partner = await this.prisma.deliveryPartner.findUnique({
        where: { id: partnerId },
      });
      if (!partner) {
        throw new NotFoundException('Delivery partner not found');
      }
      if (!partner.isActive) {
        throw new BadRequestException('Delivery partner is inactive');
      }
      if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
        throw new BadRequestException('Cannot assign partner to completed or cancelled order');
      }
      const userPhone = order.user?.phone || '';
      const maskedPhone = userPhone.length > 4
        ? userPhone.slice(0, 3) + '****' + userPhone.slice(-2)
        : userPhone;
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId: partnerId,
          deliveryStatus: 'ASSIGNED',
          userPhoneMasked: maskedPhone,
        },
        include: {
          deliveryPartner: true,
          user: true,
        },
      });
      try {
        await this.notificationsService.sendToUser({
          userId: order.userId,
          title: 'Delivery Partner Assigned',
          body: `${partner.name} will deliver your order #${order.orderId}`,
          data: {
            orderId: orderId.toString(),
            type: 'delivery_assigned',
            partnerName: partner.name,
            partnerPhone: partner.phone,
          },
        });
        await this.notificationsService.sendToTopic('delivery_partners', {
          title: 'New Delivery Assignment',
          body: `Order #${order.orderId} - ${order.user?.name || 'Customer'}`,
          data: {
            orderId: orderId.toString(),
            type: 'new_delivery',
            customerName: order.user?.name,
            customerPhone: order.user?.phone,
            address: updatedOrder.addressId?.toString(),
          },
        });
      } catch (notifError: any) {
        this.logger.warn(`⚠️ Delivery notification failed: ${notifError.message}`);
      }
      return {
        success: true,
        message: 'Delivery partner assigned successfully',
        data: {
          orderId: updatedOrder.orderId,
          partner: {
            id: updatedOrder.deliveryPartner?.id,
            name: updatedOrder.deliveryPartner?.name,
            phone: updatedOrder.deliveryPartner?.phone,
          },
          status: updatedOrder.deliveryStatus,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error assigning delivery partner:`, error.message);
      throw error;
    }
  }

  async logCall(orderId: number, durationSeconds?: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      const existingLog = (order.callLog as any) || { attempts: 0, logs: [] };
      const newLog = {
        attempts: existingLog.attempts + 1,
        lastCallAt: new Date().toISOString(),
        duration: durationSeconds || 0,
        logs: [
          ...(existingLog.logs || []),
          {
            timestamp: new Date().toISOString(),
            duration: durationSeconds || 0,
            status: durationSeconds ? 'completed' : 'missed',
          },
        ],
      };
      await this.prisma.order.update({
        where: { id: orderId },
        data: { callLog: newLog as any },
      });
      return {
        success: true,
        message: 'Call logged successfully',
        data: newLog,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error logging call:`, error.message);
      throw error;
    }
  }

  async getDeliveryInfo(orderId: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderId: true,
          deliveryStatus: true,
          deliveryPartnerId: true,
          deliveryPartner: {
            select: {
              id: true,
              name: true,
              phone: true,
              isActive: true,
            },
          },
          userPhoneMasked: true,
          callLog: true,
        },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return {
        success: true,
        data: {
          orderId: order.orderId,
          deliveryStatus: order.deliveryStatus,
          partner: order.deliveryPartner,
          maskedPhone: order.userPhoneMasked,
          callHistory: order.callLog,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching delivery info:`, error.message);
      throw error;
    }
  }

  async updateDeliveryStatus(orderId: number, status: string) {
    try {
      const allowedStatuses = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
      if (!allowedStatuses.includes(status.toUpperCase())) {
        throw new BadRequestException('Invalid delivery status');
      }
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true, deliveryPartner: true },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { deliveryStatus: status.toUpperCase() },
      });
      try {
        await this.notificationsService.sendToUser({
          userId: order.userId,
          title: `Delivery Update`,
          body: `Your order #${order.orderId} is now ${status.replace('_', ' ').toLowerCase()}`,
          data: {
            orderId: orderId.toString(),
            type: 'delivery_update',
            status: status.toUpperCase(),
          },
        });
      } catch (notifError: any) {
        this.logger.warn(`⚠️ Delivery update notification failed: ${notifError.message}`);
      }
      return {
        success: true,
        message: 'Delivery status updated',
        data: {
          orderId: updatedOrder.orderId,
          deliveryStatus: updatedOrder.deliveryStatus,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error updating delivery status:`, error.message);
      throw error;
    }
  }

  async getActiveDeliveryPartners() {
    try {
      const partners = await this.prisma.deliveryPartner.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
      return {
        success: true,
        data: partners,
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching delivery partners:`, error.message);
      throw error;
    }
  }
}