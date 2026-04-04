import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateUPIPaymentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  orderId: number;

  @IsString()
  @IsNotEmpty()
  upiApp?: string;
}

export class VerifyUPIPaymentDto {
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}

export class UPIPaymentResponseDto {
  success: boolean;
  data?: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
    userId: number;
    internalOrderId: number;
  };
  message?: string;
}