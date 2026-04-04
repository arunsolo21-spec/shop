import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UPICallbackDto {
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  error?: string;

  @IsString()
  @IsOptional()
  errorDescription?: string;

  @IsString()
  @IsOptional()
  errorSource?: string;

  @IsString()
  @IsOptional()
  errorStep?: string;

  @IsString()
  @IsOptional()
  errorReason?: string;

  @IsString()
  @IsOptional()
  errorMetadata?: string;
}

export class UPICallbackResponseDto {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    paymentId: string;
    status: string;
  };
}