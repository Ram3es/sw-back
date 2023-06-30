import { Controller, Get, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam..guard';

@Controller('auth')
export class AuthController {
  @UseGuards(SteamAuthGuard)
  @Get('steam')
  async steamLogin() {
    console.log('steam login');
  }

  @UseGuards(SteamAuthGuard)
  @Get('steam/verify')
  async steamLoginCallback() {
    console.log('steam login SUCCESS');
  }
}
