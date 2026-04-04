import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findOne(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error: any) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      return null;
    }
  }

  async create(data: any) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: any) {
      this.logger.error(`Error creating user:`, error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async getProfile(userId: number) {
    try {
      this.logger.log(`👤 Fetching profile for user ${userId}`);
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          profileImage: true,
          isActive: true,
          createdAt: true,
        },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        throw new NotFoundException('User not found');
      }

      this.logger.log(`✅ Profile fetched successfully for user ${userId}`);
      return { success: true, data: user };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  }

  async updateProfile(userId: number, dto: UpdateUserDto) {
    try {
      this.logger.log(`✏️ Updating profile for user ${userId}`);
      
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name,
          phone: dto.phone,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          profileImage: true,
          isActive: true,
        },
      });

      this.logger.log(`✅ Profile updated successfully for user ${userId}`);
      return { success: true, data: user };
    } catch (error: any) {
      this.logger.error(`❌ Error updating profile for user ${userId}:`, error);
      throw new BadRequestException('Failed to update profile');
    }
  }

  async getAddresses(userId: number) {
    try {
      this.logger.log(`📍 Fetching addresses for user ${userId}`);
      
      const addresses = await this.prisma.address.findMany({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });

      this.logger.log(`✅ Found ${addresses.length} addresses for user ${userId}`);
      return { success: true, data: addresses };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching addresses for user ${userId}:`, error);
      return { success: true, data: [] };
    }
  }

  async getAddress(userId: number, id: number) {
    try {
      const address = await this.prisma.address.findFirst({
        where: { id, userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      return { success: true, data: address };
    } catch (error: any) {
      this.logger.error(`Error fetching address ${id}:`, error);
      throw error;
    }
  }

  async createAddress(userId: number, dto: CreateAddressDto) {
    try {
      this.logger.log(`➕ Creating address for user ${userId}`);
      
      if (dto.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const address = await this.prisma.address.create({
        data: { ...dto, userId, state: dto.state || 'Tamil Nadu', country: dto.country || 'India' },
      });

      this.logger.log(`✅ Address created successfully: ${address.id}`);
      return { success: true, data: address };
    } catch (error: any) {
      this.logger.error(`❌ Error creating address:`, error);
      throw new BadRequestException('Failed to create address');
    }
  }

  async updateAddress(userId: number, id: number, dto: UpdateAddressDto) {
    try {
      this.logger.log(`✏️ Updating address ${id} for user ${userId}`);
      
      const existing = await this.prisma.address.findFirst({ where: { id, userId } });
      
      if (!existing) {
        throw new NotFoundException('Address not found');
      }

      if (dto.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const address = await this.prisma.address.update({
        where: { id },
        data: dto,
      });

      this.logger.log(`✅ Address updated successfully: ${address.id}`);
      return { success: true, data: address };
    } catch (error: any) {
      this.logger.error(`❌ Error updating address ${id}:`, error);
      throw new BadRequestException('Failed to update address');
    }
  }

  async deleteAddress(userId: number, id: number) {
    try {
      this.logger.log(`🗑️ Deleting address ${id} for user ${userId}`);
      
      const existing = await this.prisma.address.findFirst({ where: { id, userId } });
      
      if (!existing) {
        throw new NotFoundException('Address not found');
      }

      await this.prisma.address.delete({ where: { id } });

      this.logger.log(`✅ Address deleted successfully: ${id}`);
      return { success: true, message: 'Address deleted' };
    } catch (error: any) {
      this.logger.error(`❌ Error deleting address ${id}:`, error);
      throw new BadRequestException('Failed to delete address');
    }
  }

  async setDefaultAddress(userId: number, id: number) {
    try {
      this.logger.log(`⭐ Setting address ${id} as default for user ${userId}`);
      
      const existing = await this.prisma.address.findFirst({ where: { id, userId } });
      
      if (!existing) {
        throw new NotFoundException('Address not found');
      }

      await this.prisma.$transaction([
        this.prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        }),
        this.prisma.address.update({
          where: { id },
          data: { isDefault: true },
        }),
      ]);

      this.logger.log(`✅ Default address updated successfully: ${id}`);
      return { success: true, message: 'Default address updated' };
    } catch (error: any) {
      this.logger.error(`❌ Error setting default address ${id}:`, error);
      throw new BadRequestException('Failed to set default address');
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formattedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        totalOrders: user._count.orders,
      }));

      return { success: true, data: formattedUsers };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching all users:`, error);
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async findById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          addresses: true,
          orders: {
            select: {
              id: true,
              orderId: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        success: true,
        data: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          orders: user.orders.map((o) => ({
            ...o,
            createdAt: o.createdAt.toISOString(),
          })),
        },
      };
    } catch (error: any) {
      this.logger.error(`❌ Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          name: dto.name,
          phone: dto.phone,
          role: dto.role,
          isActive: dto.isActive,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
        },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      this.logger.error(`❌ Error updating user ${id}:`, error);
      throw new BadRequestException('Failed to update user');
    }
  }

  async blockUser(id: number, isActive: boolean) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updated = await this.prisma.user.update({
        where: { id },
        data: { isActive },
        select: { id: true, email: true, name: true, isActive: true },
      });

      return { success: true, data: updated };
    } catch (error: any) {
      this.logger.error(`❌ Error blocking user ${id}:`, error);
      throw new BadRequestException('Failed to block user');
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return { success: true, message: 'User soft deleted' };
    } catch (error: any) {
      this.logger.error(`❌ Error deleting user ${id}:`, error);
      throw new BadRequestException('Failed to delete user');
    }
  }
}