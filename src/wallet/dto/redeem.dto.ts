import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemDTO {
  @IsString()
  @IsNotEmpty()
  code: string;
}
