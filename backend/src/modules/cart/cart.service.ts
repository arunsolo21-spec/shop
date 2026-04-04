import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  
  constructor(private prisma: PrismaService) {}

  private formatCart(cart: any) {
    if (!cart || !cart.items) {
      return { success: true, data: { items: [] } };
    }

    const items = cart.items.map((item: any) => {
      let image = 'https://via.placeholder.com/150?text=Product';
      if (item.product?.imageUrl) {
        image = item.product.imageUrl;
      }
      return {
        productId: item.productId.toString(),
        name: item.product?.name ?? 'Unknown Product',
        price: item.product?.price ?? 0,
        mrp: item.product?.mrp ?? item.product?.price ?? 0,
        image: image,
        quantity: item.quantity ?? 1,
        unit: item.product?.variant ?? '1 unit',
        discount: item.product?.discount ?? 0,
      };
    }).filter(item => item !== null);

    return { success: true, data: { items } };
  }

  async getCart(userId: number) {
    try {
      if (!userId || userId <= 0) {
        return { success: true, data: { items: [] } };
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  mrp: true,
                  imageUrl: true,
                  variant: true,
                  discount: true,
                  inStock: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });

      if (!cart) {
        return { success: true, data: { items: [] } };
      }

      return this.formatCart(cart);
    } catch (error: any) {
      this.logger.error(`❌ Error fetching cart:`, error.message);
      return { success: true, data: { items: [] } };
    }
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Invalid user authentication');
      }

      if (dto.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        select: {
          id: true,
          name: true,
          price: true,
          inStock: true,
          quantity: true,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (!product.inStock) {
        throw new BadRequestException(`Product "${product.name}" is out of stock`);
      }

      if (product.quantity < dto.quantity) {
        throw new BadRequestException(`Only ${product.quantity} items available in stock`);
      }

      let cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
        },
      });

      if (existingItem) {
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + dto.quantity },
        });
      } else {
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: dto.productId,
            quantity: dto.quantity,
          },
        });
      }

      return await this.getCart(userId);
    } catch (error: any) {
      this.logger.error(`❌ Error adding to cart:`, error.message);
      throw error;
    }
  }

  async removeFromCart(userId: number, productId: number) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Invalid user authentication');
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (!item) {
        throw new NotFoundException('Item not found in cart');
      }

      await this.prisma.cartItem.delete({
        where: { id: item.id },
      });

      return await this.getCart(userId);
    } catch (error: any) {
      this.logger.error(`❌ Error removing from cart:`, error.message);
      throw error;
    }
  }

  async updateQuantity(userId: number, dto: UpdateCartDto) {
    try {
      if (!userId || userId <= 0) {
        throw new BadRequestException('Invalid user authentication');
      }

      if (dto.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: dto.productId,
        },
      });

      if (!item) {
        throw new NotFoundException('Item not found in cart');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
        select: { quantity: true, name: true },
      });

      if (product && dto.quantity > product.quantity) {
        throw new BadRequestException(`Only ${product.quantity} items available for "${product.name}"`);
      }

      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: dto.quantity },
      });

      return await this.getCart(userId);
    } catch (error: any) {
      this.logger.error(`❌ Error updating quantity:`, error.message);
      throw error;
    }
  }

  async clearCart(userId: number) {
    try {
      if (!userId || userId <= 0) {
        return { success: true, data: { items: [] } };
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await this.prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return { success: true, data: { items: [] } };
    } catch (error: any) {
      this.logger.error(`❌ Error clearing cart:`, error.message);
      return { success: true, data: { items: [] } };
    }
  }
}