import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PayoutDTO {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  note: string;
}
