import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  EPaymentMethod,
  EPaymentOperation,
  EPaymentStatus,
} from 'src/constants';

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
  externalUserId: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EPaymentStatus)
  status: EPaymentStatus;

  @IsOptional()
  timestamp?: string | Date;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(EPaymentOperation)
  type: EPaymentOperation;

  @IsOptional()
  txid?: string;
}
