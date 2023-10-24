import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsPostalCode,
} from 'class-validator';

export class CreateBillingAddressDTO {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  userId: number;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsOptional()
  streetAddress2?: string | null;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  province?: string | null;

  @IsString()
  @IsNotEmpty()
  @IsPostalCode('any')
  zip: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @IsNotEmpty()
  birthDate: number;
}
