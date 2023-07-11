import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { PAYOUT_LIMITS } from 'src/constants/inxex';

export class PayoutDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional() // temporarily optional
  method: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(PAYOUT_LIMITS.MIN, { message: 'payout is too low.' })
  @Max(PAYOUT_LIMITS.MAX, { message: 'payout is too big.' })
  amount: number;

  @IsString()
  @IsOptional()
  note: string;
}
