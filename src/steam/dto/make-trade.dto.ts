import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ValidateItem } from 'src/inventory/dto/validate-inventory.dto';

export class MakeOfferItem extends ValidateItem {
  @IsString()
  @IsNotEmpty()
  classid: string;

  @IsString()
  @IsNotEmpty()
  instanceid: string;

  @IsString()
  @IsNotEmpty()
  steamid: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  tradable: boolean;
}

export class MakeTradeOfferDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MakeOfferItem)
  tradeItems: MakeOfferItem[];
}
