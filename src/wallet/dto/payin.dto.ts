import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { EPaymentMethod } from 'src/constants';

export class PayinDTO {
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  method: EPaymentMethod;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  balanceAmount: number

}

