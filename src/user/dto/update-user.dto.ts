import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsEmail,
} from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tradeUrl: string;

  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  notifications: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  active: number;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;
}
