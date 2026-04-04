import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getUserOrders(@Request() req) {
    const userId = req.user.userId;
    this.logger.log(`📥 GET /orders - User ${userId}`);
    return this.ordersService.getUserOrders(userId);
  }

  @Get(':id')
  async getOrder(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId;
    this.logger.log(`📥 GET /orders/${id} - User ${userId}`);
    return this.ordersService.getOrder(userId, id);
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async createOrder(@Request() req, @Body() dto: CreateOrderDto) {
    const userId = req.user.userId;
    this.logger.log(`📥 POST /orders - User ${userId}`);
    return this.ordersService.createOrder(userId, dto);
  }

  @Get('admin/all')
  async getAllOrders(
    @Request() req,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      if (req.user.role !== 'ADMIN') {
        this.logger.warn(`⚠️ Non-admin user ${req.user.userId} tried to access admin orders`);
        throw new BadRequestException('Access denied. Admin only.');
      }

      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 20;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('Invalid page number');
      }
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Invalid limit (must be between 1 and 100)');
      }

      this.logger.log(`📥 GET /orders/admin/all - Admin ${req.user.userId} (status: ${status || 'ALL'}, page: ${pageNum}, limit: ${limitNum})`);

      const result = await this.ordersService.getAllOrders(status, pageNum, limitNum);

      this.logger.log(`✅ Returning ${result.data?.data?.length || 0} orders`);

      return result;
    } catch (error) {
      this.logger.error(`❌ Error in getAllOrders:`, error);
      throw error;
    }
  }

  @Get('admin/:id')
  async getOrderById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    try {
      if (req.user.role !== 'ADMIN') {
        this.logger.warn(`⚠️ Non-admin user ${req.user.userId} tried to access order ${id}`);
        throw new BadRequestException('Access denied. Admin only.');
      }

      this.logger.log(`📥 GET /orders/admin/${id} - Admin ${req.user.userId}`);
      return this.ordersService.getOrderById(id);
    } catch (error) {
      this.logger.error(`❌ Error in getOrderById:`, error);
      throw error;
    }
  }

  @Patch('admin/:id/status')
  async updateOrderStatus(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    try {
      if (req.user.role !== 'ADMIN') {
        this.logger.warn(`⚠️ Non-admin user ${req.user.userId} tried to update order ${id} status`);
        throw new BadRequestException('Access denied. Admin only.');
      }

      if (!dto.status) {
        throw new BadRequestException('Status is required');
      }

      this.logger.log(`📥 PATCH /orders/admin/${id}/status - Admin ${req.user.userId} (status: ${dto.status})`);
      return this.ordersService.updateOrderStatus(id, dto, req.user.userId);
    } catch (error) {
      this.logger.error(`❌ Error in updateOrderStatus:`, error);
      throw error;
    }
  }

  @Get('admin/stats/summary')
  async getOrderStats(@Request() req) {
    try {
      if (req.user.role !== 'ADMIN') {
        this.logger.warn(`⚠️ Non-admin user ${req.user.userId} tried to access order stats`);
        throw new BadRequestException('Access denied. Admin only.');
      }

      this.logger.log(`📥 GET /orders/admin/stats/summary - Admin ${req.user.userId}`);
      return this.ordersService.getOrderStats();
    } catch (error) {
      this.logger.error(`❌ Error in getOrderStats:`, error);
      throw error;
    }
  }
}