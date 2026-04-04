import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
  BadRequestException
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async getAllBanners() {
    return this.bannersService.findAll();
  }

  @Get('active')
  async getActiveBanners() {
    return this.bannersService.findActive();
  }

  @Get(':id')
  async getBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBannerDto
  ) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBanner(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.delete(id);
  }

  @Patch(':id/priority')
  @UseGuards(JwtAuthGuard)
  async updatePriority(
    @Param('id', ParseIntPipe) id: number,
    @Body('priority') priority: number
  ) {
    if (priority === undefined || priority === null) {
      throw new BadRequestException('Priority is required');
    }
    return this.bannersService.updatePriority(id, priority);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.toggleStatus(id);
  }
}