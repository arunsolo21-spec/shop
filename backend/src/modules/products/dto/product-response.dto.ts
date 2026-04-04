import { IsInt, IsString, IsBoolean, IsNumber, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  priority: number;
}

export class SubCategoryDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  priority: number;

  @IsInt()
  categoryId: number;

  @ValidateNested()
  @Type(() => CategoryDto)
  category?: CategoryDto;
}

export class PricingDto {
  @IsNumber()
  price: number;

  @IsNumber()
  mrp: number;

  @IsInt()
  discount: number;

  @IsString()
  currency: string;
}

export class ProductResponseDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  brand: string;

  @ValidateNested()
  @Type(() => SubCategoryDto)
  subCategory: SubCategoryDto;

  @IsString()
  variant: string;

  @ValidateNested()
  @Type(() => PricingDto)
  pricing: PricingDto;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  inStock: boolean;

  @IsInt()
  quantity: number;

  @IsBoolean()
  isFeatured: boolean;

  @IsBoolean()
  isBestseller: boolean;
}