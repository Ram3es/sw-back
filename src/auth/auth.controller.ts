import { Controller, Get, Req, Res, Session, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(SteamAuthGuard)
  @Get('steam')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  steamLogin() {}

  @UseGuards(SteamAuthGuard)
  @Get('steam/verify')
  async steamLoginCallback(@Res() res, @Req() req: Request) {
    await this.authService.steamLogin(req);
    res.redirect('/');
  }

  @Get('logout')
  logout(@Res() res, @Req() req: any) {
    req.session.destroy();
    res.redirect('/');
  }
}
