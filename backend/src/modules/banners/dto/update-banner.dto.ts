import { IsString, IsBoolean, IsInt, IsOptional, Min, IsArray } from 'class-validator';

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

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
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;
}