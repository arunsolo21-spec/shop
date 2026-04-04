import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueue } from '../jobs/queues/order.queue';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private orderQueue: OrderQueue,
    private notificationsService: NotificationsService,
  ) {}

  async getUserOrders(userId: number) {
    try {
      if (!userId || userId <= 0) {
        return { success: true, data: [] };
      }
      const orders = await this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
          address: {
            select: {
              street: true,
              landmark: true,
              city: true,
              district: true,
              state: true,
              zip: true,
            },
          },
          deliveryPartner: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        orderId: `#ORD${order.id.toString().padStart(5, '0')}`,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        deliveryStatus: order.deliveryStatus,
        deliveryPartner: order.deliveryPartner,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items: order.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.imageUrl || '',
          price: item.price,
          quantity: item.quantity,
        })),
        address: order.address
          ? `${order.address.street}, ${order.address.landmark ? order.address.landmark + ', ' : ''}${order.address.city}, ${order.address.district || ''}, ${order.address.state} ${order.address.zip}`
          : '',
      }));
      return { success: true, data: formattedOrders };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching orders:`, error.message);
      return { success: true, data: [] };
    }
  }

  async getOrder(userId: number, orderId: number) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Invalid user authentication');
      }
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
          address: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          deliveryPartner: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      const userPhone = order.user?.phone || '';
      const maskedPhone = userPhone.length > 4
        ? userPhone.slice(0, 3) + '****' + userPhone.slice(-2)
        : userPhone;
      return {
        success: true,
        data: {
          id: order.id,
          orderId: `#ORD${order.id.toString().padStart(5, '0')}`,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          deliveryStatus: order.deliveryStatus,
          deliveryPartner: order.deliveryPartner,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          user: {
            ...order.user,
            phone: maskedPhone,
          },
          items: order.items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            image: item.product.imageUrl || '',
            price: item.price,
            quantity: item.quantity,
          })),
          address: order.address,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching order:`, error.message);
      throw error;
    }
  }

  async createOrder(userId: number, dto: CreateOrderDto) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Invalid user authentication');
      }
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      if (dto.paymentMethod !== 'COD' && dto.paymentMethod !== 'UPI' && dto.paymentMethod !== 'ONLINE') {
        throw new BadRequestException('Invalid payment method');
      }
      if (dto.addressId) {
        const address = await this.prisma.address.findFirst({
          where: { id: dto.addressId, userId },
        });
        if (!address) {
          throw new BadRequestException('Invalid address');
        }
      }
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      let totalAmount = 0;
      const orderItemsData = [];
      for (const item of dto.items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }
        if (!product.inStock) {
          throw new BadRequestException(`Product ${product.name} is out of stock`);
        }
        if (item.quantity < 1 || item.quantity > 100) {
          throw new BadRequestException(`Invalid quantity for product ${item.productId}`);
        }
        if (product.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });
      }
      if (totalAmount <= 0) {
        throw new BadRequestException('Invalid order total');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      const order = await this.prisma.$transaction(async (tx) => {
        const count = await tx.order.count();
        const newOrderId = `#ORD${(count + 1).toString().padStart(5, '0')}`;
        const createdOrder = await tx.order.create({
          data: {
            orderId: newOrderId,
            userId,
            totalAmount,
            paymentMethod: dto.paymentMethod,
            paymentStatus: dto.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
            addressId: dto.addressId,
            status: OrderStatus.PENDING,
            deliveryStatus: 'PENDING',
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
            user: true,
          },
        });
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
        for (const item of dto.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
        return createdOrder;
      });
      this.orderQueue.addOrderNotification({
        orderId: order.id,
        userId,
        userEmail: user.email,
        orderTotal: totalAmount,
        orderStatus: order.status,
        type: 'order-created',
      }).catch((error: any) => {
        this.logger.warn(`⚠️ Failed to queue order notification: ${error.message}`);
      });
      return {
        success: true,
        message: 'Order placed successfully',
        data: {
          id: order.id,
          orderId: order.orderId,
          userId: order.userId,
          totalAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          deliveryStatus: order.deliveryStatus,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error creating order:`, error.message);
      throw error;
    }
  }

  async getAllOrders(status?: string, page: number = 1, limit: number = 20) {
    try {
      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }
      const skip = (page - 1) * limit;
      const whereClause: any = {};
      if (status && status !== 'ALL') {
        whereClause.status = status;
      }
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    price: true,
                  },
                },
              },
            },
            address: true,
            deliveryPartner: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where: whereClause }),
      ]);
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        orderId: order.orderId || `#ORD${order.id.toString().padStart(5, '0')}`,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        deliveryStatus: order.deliveryStatus,
        deliveryPartner: order.deliveryPartner,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          image: item.product.imageUrl || '',
          price: item.price,
          quantity: item.quantity,
        })),
        address: order.address
          ? `${order.address.street}, ${order.address.landmark ? order.address.landmark + ', ' : ''}${order.address.city}, ${order.address.district || ''}, ${order.address.state} ${order.address.zip}`
          : null,
      }));
      return {
        success: true,
        data: {
          data: formattedOrders,
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching all orders:`, error.message);
      throw error;
    }
  }

  async getOrderById(orderId: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
          address: true,
          deliveryPartner: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      });
      if (!order) {
        throw new NotFoundException('Order not found');
      }
      return {
        success: true,
        data: {
          id: order.id,
          orderId: order.orderId || `#ORD${order.id.toString().padStart(5, '0')}`,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          deliveryStatus: order.deliveryStatus,
          deliveryPartner: order.deliveryPartner,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
          user: order.user,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            image: item.product.imageUrl || '',
            price: item.price,
            quantity: item.quantity,
          })),
          address: order.address,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching order:`, error.message);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto, adminId: number) {
    try {
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
        throw new NotFoundException('Order not found');
      }
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PACKED', 'CANCELLED'],
        PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
        OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
        DELIVERED: [],
        CANCELLED: [],
      };
      const currentStatus = order.status as OrderStatus;
      const allowedTransitions = validTransitions[currentStatus];
      if (!allowedTransitions.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot change status from ${currentStatus} to ${dto.status}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
        );
      }
      let deliveryStatus = order.deliveryStatus;
      if (dto.status === OrderStatus.OUT_FOR_DELIVERY) {
        deliveryStatus = 'OUT_FOR_DELIVERY';
      } else if (dto.status === OrderStatus.DELIVERED) {
        deliveryStatus = 'DELIVERED';
      }
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            status: dto.status,
            deliveryStatus,
          },
          include: {
            user: true,
            items: { include: { product: true } },
            address: true,
          },
        });
        if (dto.status === OrderStatus.CANCELLED) {
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
        return updated;
      });
      const notificationType =
        dto.status === OrderStatus.CONFIRMED
          ? 'order-confirmed'
          : dto.status === OrderStatus.OUT_FOR_DELIVERY
          ? 'order-shipped'
          : dto.status === OrderStatus.DELIVERED
          ? 'order-delivered'
          : dto.status === OrderStatus.CANCELLED
          ? 'order-cancelled'
          : 'order-updated';
      this.orderQueue.addOrderNotification({
        orderId: order.id,
        userId: order.userId,
        userEmail: order.user.email,
        orderTotal: order.totalAmount,
        orderStatus: dto.status,
        type: notificationType as any,
      }).catch((error: any) => {
        this.logger.warn(`⚠️ Failed to queue order notification: ${error.message}`);
      });
      try {
        await this.notificationsService.sendToUser({
          userId: order.userId,
          title: `Order ${updatedOrder.orderId} Updated`,
          body: `Status changed to ${dto.status.replace('_', ' ')}`,
          data: {
            orderId: orderId.toString(),
            type: 'order_status',
            status: dto.status,
          },
        });
      } catch (notifError: any) {
        this.logger.warn(`⚠️ Failed to send direct notification: ${notifError.message}`);
      }
      return {
        success: true,
        message: `Order status updated to ${dto.status}`,
        data: {
          id: updatedOrder.id,
          orderId: updatedOrder.orderId || `#ORD${updatedOrder.id.toString().padStart(5, '0')}`,
          status: updatedOrder.status,
          deliveryStatus: updatedOrder.deliveryStatus,
          updatedAt: updatedOrder.updatedAt.toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error updating order status:`, error.message);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        packedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
      ] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.order.count({ where: { status: 'PACKED' } }),
        this.prisma.order.count({ where: { status: 'OUT_FOR_DELIVERY' } }),
        this.prisma.order.count({ where: { status: 'DELIVERED' } }),
        this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      ]);
      const deliveredRevenue = await this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      });
      const totalRevenue = deliveredRevenue._sum.totalAmount || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      return {
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          packedOrders,
          outForDeliveryOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching order statistics:`, error.message);
      throw error;
    }
  }
}