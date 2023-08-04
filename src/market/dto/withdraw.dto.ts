import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class WithdrawDTO {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  assetIds: string[];
}
