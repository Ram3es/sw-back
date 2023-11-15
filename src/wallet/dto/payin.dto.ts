import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { EPaymentMethod } from 'src/constants';

export class PayoutDTO {
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  method: EPaymentMethod;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}
