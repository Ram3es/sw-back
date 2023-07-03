import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam..guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SteamAuthGuard)
  @Get('steam')
  async steamLogin() {
    console.log('steam login');
  }

  @UseGuards(SteamAuthGuard)
  @Get('steam/verify')
  async steamLoginCallback(@Query() query, @Req() request: Request) {
    console.log('steam login SUCCESS');
    this.authService.steamLogin({ query, request });
  }
}
