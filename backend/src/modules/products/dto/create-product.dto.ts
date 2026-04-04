import { IsString, IsNumber, IsBoolean, IsOptional, IsInt, IsArray, Min, Max, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  brand: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  variant?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  mrp: number;

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
  @Min(1)
  @IsOptional()
  subCategoryId?: number;
}