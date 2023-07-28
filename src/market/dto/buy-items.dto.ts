import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class BuyItemDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  assetid: string;

  @IsString()
  @IsNotEmpty()
  classid: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  appid: string;

  @IsNumber()
  @IsNotEmpty()
  price: string;
}
