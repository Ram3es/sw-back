import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserCryptoWalletDTO {
  @IsString()
  @IsNotEmpty()
  wallet: string;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
