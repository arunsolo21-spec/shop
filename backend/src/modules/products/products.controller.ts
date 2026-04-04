import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subCategoryId') subCategoryId?: string,
    @Query('sortBy') sortBy?: 'name' | 'price' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('inStock') inStock?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 12;
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
    const parsedSubCategoryId = subCategoryId
      ? parseInt(subCategoryId, 10)
      : undefined;
    const parsedMinPrice = minPrice ? parseFloat(minPrice) : undefined;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : undefined;
    const parsedInStock =
      inStock === 'true' ? true : inStock === 'false' ? false : undefined;

    if (page && (isNaN(pageNum) || pageNum < 1)) {
      throw new BadRequestException('Invalid page number');
    }
    if (limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
      throw new BadRequestException('Invalid limit (1-100)');
    }
    if (categoryId && isNaN(parsedCategoryId)) {
      throw new BadRequestException('Invalid categoryId');
    }
    if (subCategoryId && isNaN(parsedSubCategoryId)) {
      throw new BadRequestException('Invalid subCategoryId');
    }

    return this.productsService.getProducts({
      page: pageNum,
      limit: limitNum,
      search,
      categoryId: parsedCategoryId,
      subCategoryId: parsedSubCategoryId,
      sortBy,
      sortOrder,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      inStock: parsedInStock,
    });
  }

  @Get('featured')
  async getFeaturedProducts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.productsService.getFeaturedProducts(limitNum);
  }

  @Get('bestsellers')
  async getBestsellers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 12;
    return this.productsService.getBestsellers(limitNum);
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post('by-ids')
  async getProductsByIds(@Body() dto: { productIds: string[] }) {
    return this.productsService.getProductsByIds(dto.productIds);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async createProduct(@Body() dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);
    return this.productsService.createProduct(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    this.logger.log(`Updating product ${id}`);
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting product ${id}`);
    return this.productsService.deleteProduct(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
    @Body('inStock') inStock: boolean,
  ) {
    if (quantity === undefined || inStock === undefined) {
      throw new BadRequestException('Quantity and inStock are required');
    }
    this.logger.log(
      `Updating stock for product ${id}: qty=${quantity}, inStock=${inStock}`,
    );
    return this.productsService.updateStock(id, quantity, inStock);
  }
}