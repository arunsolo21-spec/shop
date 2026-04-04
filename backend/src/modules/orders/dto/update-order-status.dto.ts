import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Invalid status. Must be one of: PENDING, CONFIRMED, PACKED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED',
  })
  status: OrderStatus;

  @IsString()
  @IsOptional()
  note?: string;
}