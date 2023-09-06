import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { CreateBillingAddressDTO } from './create-billing-address.dto';

export class UpdateBillingAddressDTO extends PartialType(
  CreateBillingAddressDTO,
) {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  id: number;
}
