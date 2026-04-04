import { IsString, IsNumber, IsBoolean, IsOptional, IsInt, IsArray, Min, Max } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  variant?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  mrp?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  inStock?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isBestseller?: boolean;

  @IsBoolean()
  @IsOptional()
  showOnHome?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  searchKeywords?: string[];

  @IsInt()
  @IsOptional()
  subCategoryId?: number;
}