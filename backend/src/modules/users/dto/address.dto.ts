import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export const TAMIL_NADU_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thoothukudi',
  'Dindigul',
  'Thanjavur',
  'Ranipet',
  'Sivaganga',
  'Karur',
  'Ramanathapuram',
  'Virudhunagar',
  'Tiruppur',
  'Nagapattinam',
  'Namakkal',
  'Krishnagiri',
  'Ariyalur',
  'Perambalur',
  'Nilgiris',
  'Tiruvannamalai',
  'Pudukkottai',
  'Kanniyakumari',
  'Cuddalore',
  'Kanchipuram',
  'Villupuram',
  'Tiruvarur',
  'Dharmapuri',
];

export class CreateAddressDto {
  @IsNotEmpty({ message: 'Recipient name is required' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @MinLength(10, { message: 'Phone number must be 10 digits' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid Indian phone number (must start with 6-9 and be 10 digits)',
  })
  phone: string;

  @IsNotEmpty({ message: 'Street address is required' })
  @IsString()
  @MinLength(5, { message: 'Street address must be at least 5 characters' })
  street: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Landmark must be at least 2 characters' })
  landmark?: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  @MinLength(2, { message: 'City is required' })
  city: string;

  @IsNotEmpty({ message: 'District is required' })
  @IsString()
  @MinLength(2, { message: 'District is required' })
  district: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'State must be at least 2 characters' })
  state?: string;

  @IsNotEmpty({ message: 'Pincode is required' })
  @IsString()
  @MinLength(6, { message: 'Pincode must be 6 digits' })
  @Matches(/^\d{6}$/, {
    message: 'Invalid pincode (must be exactly 6 digits)',
  })
  zip: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Phone number must be 10 digits' })
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Invalid Indian phone number (must start with 6-9 and be 10 digits)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Street address must be at least 5 characters' })
  street?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Landmark must be at least 2 characters' })
  landmark?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'City is required' })
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'District is required' })
  district?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'State must be at least 2 characters' })
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Pincode must be 6 digits' })
  @Matches(/^\d{6}$/, {
    message: 'Invalid pincode (must be exactly 6 digits)',
  })
  zip?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}