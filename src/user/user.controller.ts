import { Body, Controller, Get, Patch, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserCryptoWalletDTO } from './dto/create-user-cryptowallet.dto';
import { UpdateUserCryptWalletDTO } from './dto/update-user-cryptowallet.dto';
import { CreatePaymentAccountDTO } from './dto/create-payment-account.dto';
import { UpdatePaymentAccountDTO } from './dto/update-payment-account.dto';
import { UpdateBillingAddressDTO } from './dto/update-billing-address.dto';
import { CreateBillingAddressDTO } from './dto/create-billing-address.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  async me(@Req() req: any) {
    const steamId = String(req?.user?._json?.steamid);
    const user = await this.userService.findBySteamId(steamId);
    return user;
  }

  @Get('balance')
  async getUserBalance(@Req() req: Request) {
    const steamId = String(req?.user?._json?.steamid);
    return this.userService.getBalanceById(steamId);
  }

  @Get('')
  async getUserDataWithIncludes(@Req() req: Request) {
    const steamId = String(req?.user?._json?.steamid);
    return this.userService.getUserDataWithIncludes(steamId);
  }

  // update user settings
  @Patch('')
  async updateSettings(@Req() req: Request, @Body() body: UpdateUserDTO) {
    const steamId = String(req?.user?._json?.steamid);
    return this.userService.updateUserSettings(steamId, body);
  }

  @Put('wallet')
  async createOrUpdateWallet(
    @Req() req: Request,
    @Body() body: UpdateUserCryptWalletDTO,
  ) {
    const steamId = String(req?.user?._json?.steamid);
    if (body && !body.id)
      return this.userService.createCryptoWallet(
        steamId,
        body as CreateUserCryptoWalletDTO,
      );
    return this.userService.updateCryptoWallet(
      steamId,
      body as UpdateUserCryptWalletDTO,
    );
  }

  @Put('account')
  async createOrUpdatePaymentAccount(
    @Req() req: Request,
    @Body() body: UpdatePaymentAccountDTO,
  ) {
    const steamId = String(req?.user?._json?.steamid);
    if (body && !body.id)
      return this.userService.createPaymentAccount(
        steamId,
        body as CreatePaymentAccountDTO,
      );
    return this.userService.updatePaymentAccount(
      steamId,
      body as UpdatePaymentAccountDTO,
    );
  }

  // update user billing address settings
  @Put('address')
  async createOrUpdateBillingAddress(
    @Req() req: Request,
    @Body() body: UpdateBillingAddressDTO,
  ) {
    const steamId = String(req?.user?._json?.steamid);
    if (body && !body.id)
      return this.userService.createBillingAddress(
        steamId,
        body as CreateBillingAddressDTO,
      );
    return this.userService.updateBillingAddress(
      steamId,
      body as UpdateBillingAddressDTO,
    );
  }
}
