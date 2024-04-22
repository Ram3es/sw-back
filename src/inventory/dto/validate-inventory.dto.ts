import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateItem {
  @IsNumber()
  @IsNotEmpty()
  appid: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  assetid: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class ValidateInventoryDTO {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ValidateItem)
  items: ValidateItem[];
}
