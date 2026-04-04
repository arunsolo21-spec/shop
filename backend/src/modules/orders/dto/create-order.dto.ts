import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  productId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  addressId: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}