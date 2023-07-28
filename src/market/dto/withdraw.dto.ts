import { IsString, IsNotEmpty } from 'class-validator';

export class WithdrawDTO {
  @IsNotEmpty()
  @IsString({ each: true })
  assetIds: string;
}
