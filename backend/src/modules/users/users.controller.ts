import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('addresses')
  async getAddresses(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.getAddresses(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId/addresses')
  async getUserAddresses(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const currentUser = req.user;
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
      this.logger.warn(
        `User ${currentUser.userId} attempted unauthorized access to user ${userId}'s addresses`,
      );
      throw new BadRequestException(
        'Access denied. Admin privileges required.',
      );
    }
    return this.usersService.getAddresses(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('addresses/:id')
  async getAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.getAddress(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addresses')
  async createAddress(@Request() req, @Body() dto: CreateAddressDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.createAddress(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('addresses/:id')
  async updateAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.updateAddress(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.deleteAddress(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('addresses/:id/set-default')
  async setDefaultAddress(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }
    return this.usersService.setDefaultAddress(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Request() req) {
    const user = req.user;
    if (!user?.userId || !user?.role) {
      throw new BadRequestException('Invalid user context');
    }
    if (user.role !== 'ADMIN') {
      this.logger.warn(
        `Non-admin user ${user.userId} attempted to access all users`,
      );
      throw new BadRequestException(
        'Access denied. Admin privileges required.',
      );
    }
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = req.user;
    if (!user?.userId || !user?.role) {
      throw new BadRequestException('Invalid user context');
    }
    if (user.role !== 'ADMIN' && user.userId !== id) {
      this.logger.warn(
        `User ${user.userId} attempted unauthorized access to user ${id}`,
      );
      throw new BadRequestException('Access denied.');
    }
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const user = req.user;
    if (!user?.userId || user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Access denied. Admin privileges required.',
      );
    }
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/block')
  async blockUser(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    const user = req.user;
    if (!user?.userId || user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Access denied. Admin privileges required.',
      );
    }
    if (typeof isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean value');
    }
    return this.usersService.blockUser(id, isActive);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const user = req.user;
    if (!user?.userId || user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Access denied. Admin privileges required.',
      );
    }
    return this.usersService.deleteUser(id);
  }
}