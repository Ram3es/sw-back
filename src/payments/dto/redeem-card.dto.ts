import { IsNotEmpty, IsString } from 'class-validator';
import { RedeemDTO } from 'src/wallet/dto/redeem.dto';

export class RedeemCardDTO extends RedeemDTO {
  @IsString()
  @IsNotEmpty()
  externalUserId: string;
}
