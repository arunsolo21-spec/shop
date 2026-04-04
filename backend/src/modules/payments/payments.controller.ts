import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  Logger,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';
import { CreateUPIPaymentDto, VerifyUPIPaymentDto } from './dto/upi-payment.dto';
import { UPICallbackDto } from './dto/upi-callback.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private configService: ConfigService,
  ) {}

  @Post('initiate/:orderId')
  async initiatePayment(
    @Request() req,
    @Param('orderId') orderId: number,
    @Body() body: { paymentMethod: string },
  ) {
    const userId = req.user.userId;
    const paymentMethod = body.paymentMethod || 'COD';

    return this.paymentsService.initiatePayment(userId, orderId, paymentMethod);
  }

  @Post('verify/:orderId')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(
    @Request() req,
    @Param('orderId') orderId: number,
    @Body() dto: VerifyUPIPaymentDto,
  ) {
    const userId = req.user.userId;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = dto;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new BadRequestException('Missing payment verification parameters');
    }

    return this.paymentsService.verifyPayment(
      userId,
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    );
  }

  @Post('upi/initiate')
  async initiateUPIPayment(@Request() req, @Body() dto: CreateUPIPaymentDto) {
    const userId = req.user.userId;

    return this.paymentsService.initiatePayment(userId, dto.orderId, 'UPI');
  }

  @Post('upi/verify')
  @HttpCode(HttpStatus.OK)
  async verifyUPIPayment(@Request() req, @Body() dto: VerifyUPIPaymentDto) {
    const userId = req.user.userId;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = dto;

    const orderIdMatch = razorpay_order_id.match(/ORDER_(\d+)_/);
    const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : 0;

    if (!orderId) {
      throw new BadRequestException('Invalid order ID in payment response');
    }

    return this.paymentsService.verifyPayment(
      userId,
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    );
  }

  @Post('upi/callback')
  @HttpCode(HttpStatus.OK)
  async handleUPICallback(@Body() dto: UPICallbackDto) {
    this.logger.log(`UPI Callback received: ${dto.razorpay_payment_id}`);

    const orderIdMatch = dto.razorpay_order_id.match(/ORDER_(\d+)_/);
    const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : 0;

    if (!orderId) {
      return {
        success: false,
        message: 'Invalid order ID',
      };
    }

    if (dto.status === 'success') {
      return {
        success: true,
        message: 'Payment successful',
        data: {
          orderId: dto.razorpay_order_id,
          paymentId: dto.razorpay_payment_id,
          status: 'success',
        },
      };
    } else {
      return {
        success: false,
        message: dto.error || 'Payment failed',
      };
    }
  }

  @Get('status/:orderId')
  async getPaymentStatus(@Request() req, @Param('orderId') orderId: number) {
    const userId = req.user.userId;

    return this.paymentsService.getPaymentStatus(userId, orderId);
  }

  @Post('cod/confirm/:orderId')
  @HttpCode(HttpStatus.OK)
  async confirmCODPayment(@Request() req, @Param('orderId') orderId: number) {
    const userId = req.user.userId;

    const order = await this.paymentsService.processCODOnDelivery(orderId);

    return order;
  }

  @Get('upi/apps')
  async getUPIApps() {
    return this.paymentsService.getUPIApps();
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const allowedIps = this.configService
      .get<string>('WEBHOOK_ALLOWED_IPS')
      ?.split(',');

    const clientIp = req.ip || (req.socket ? req.socket.remoteAddress : undefined);

    if (allowedIps && clientIp && !allowedIps.includes(clientIp)) {
      this.logger.warn(`Webhook request from unauthorized IP: ${clientIp}`);
      throw new BadRequestException('Unauthorized webhook source');
    }

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const payload = JSON.parse(req.rawBody?.toString() || '{}');

    return this.paymentsService.handleWebhook(payload, signature);
  }
}