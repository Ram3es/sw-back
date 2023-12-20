import { PayinDTO } from './payin.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class PayoutDTO extends PayinDTO {
  @IsNotEmpty()
  @IsString()
  walletAddress: string;
}
