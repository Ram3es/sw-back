import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentAccountDTO {
  @IsString()
  @IsNotEmpty()
  accountType: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
