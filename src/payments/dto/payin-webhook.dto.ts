import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { EPaymentMethod, EPaymentStatus } from 'src/constants';

export class PayInWebhookDTO {
  @IsString()
  @IsNotEmpty()
  @IsUUID('all')
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EPaymentMethod)
  method: EPaymentMethod;

  @IsString()
  @IsNotEmpty()
  exteralUserId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EPaymentStatus)
  status: EPaymentStatus;

  @IsOptional()
  timestamp?: string
}
