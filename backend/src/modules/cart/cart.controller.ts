import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    const userId = req.user?.userId || 0;
    this.logger.log(`📥 GET /cart - User ${userId}`);
    if (!userId || userId <= 0) {
      this.logger.warn(`⚠️ Invalid userId: ${userId}`);
      return {
        success: false,
        message: 'Invalid user authentication',
        data: { items: [] },
      };
    }
    return this.cartService.getCart(userId);
  }

  @Post('add')
  async addToCart(@Request() req, @Body() dto: AddToCartDto) {
    const userId = req.user?.userId || 0;
    this.logger.log(
      `📥 POST /cart/add - User ${userId}, Product ${dto.productId}`,
    );
    if (!userId || userId <= 0) {
      this.logger.warn(`⚠️ Invalid userId: ${userId}`);
      return {
        success: false,
        message: 'Invalid user authentication',
        data: { items: [] },
      };
    }
    return this.cartService.addToCart(userId, dto);
  }

  @Put('update')
  async updateQuantity(@Request() req, @Body() dto: UpdateCartDto) {
    const userId = req.user?.userId || 0;
    this.logger.log(
      `📊 PUT /cart/update - User ${userId}, Product ${dto.productId}`,
    );
    if (!userId || userId <= 0) {
      this.logger.warn(`⚠️ Invalid userId: ${userId}`);
      return {
        success: false,
        message: 'Invalid user authentication',
        data: { items: [] },
      };
    }
    return this.cartService.updateQuantity(userId, dto);
  }

  @Delete('remove/:productId')
  async removeFromCart(
    @Request() req,
    @Param('productId') productId: number,
  ) {
    const userId = req.user?.userId || 0;
    const productIdNum = parseInt(productId.toString(), 10);
    this.logger.log(
      `🗑️ DELETE /cart/remove/${productId} - User ${userId}`,
    );
    if (!userId || userId <= 0) {
      this.logger.warn(`⚠️ Invalid userId: ${userId}`);
      return {
        success: false,
        message: 'Invalid user authentication',
        data: { items: [] },
      };
    }
    return this.cartService.removeFromCart(userId, productIdNum);
  }

  @Delete('clear')
  async clearCart(@Request() req) {
    const userId = req.user?.userId || 0;
    this.logger.log(`🧹 DELETE /cart/clear - User ${userId}`);
    if (!userId || userId <= 0) {
      this.logger.warn(`⚠️ Invalid userId: ${userId}`);
      return {
        success: false,
        message: 'Invalid user authentication',
        data: { items: [] },
      };
    }
    return this.cartService.clearCart(userId);
  }
}