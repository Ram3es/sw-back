import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentAccountDTO {
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
