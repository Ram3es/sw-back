import { IsArray, IsNotEmpty } from 'class-validator';
import { ITradeItem } from 'src/user/types/steam';
export class CreateTradeDto {
  @IsNotEmpty()
  @IsArray()
  tradeItems: any[];
}
