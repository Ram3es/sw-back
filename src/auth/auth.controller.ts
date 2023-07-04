import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam.guard';
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
  async steamLoginCallback(@Res() res, @Req() req: Request) {
    console.log('steam login SUCCESS');
    await this.authService.steamLogin(req);
    res.redirect('/');
  }
}
