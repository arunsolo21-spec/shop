import { IsString, IsBoolean, IsInt, IsOptional, Min, IsArray, IsEnum, IsDateString } from 'class-validator';

export enum BannerLinkType {
  NONE = 'NONE',
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  MULTIPLE_PRODUCTS = 'MULTIPLE_PRODUCTS',
  SEARCH = 'SEARCH',
}

export class CreateBannerDto {
  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  ctaText?: string;

  @IsEnum(BannerLinkType)
  @IsOptional()
  linkType?: BannerLinkType = BannerLinkType.NONE;

  @IsInt()
  @IsOptional()
  linkId?: number;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  targetScreen?: string;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIds?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number = 0;

  @IsInt()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}