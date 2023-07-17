import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam.guard';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { Request } from 'express';
import { DEFAULT_LOGIN_REDIRECT } from 'src/constants/inxex';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(SteamAuthGuard)
  @Get('steam')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  steamLogin() {}

  @Public()
  @UseGuards(SteamAuthGuard)
  @Get('steam/verify')
  async steamLoginCallback(@Res() res, @Req() req: Request) {
    const continueUrl = req?.query?.continue;
    await this.authService.steamLogin(req);
    delete req.session.continueUrl;
    res.redirect(continueUrl || DEFAULT_LOGIN_REDIRECT);
  }

  @Public()
  @Get('logout')
  logout(@Res() res, @Req() req: any) {
    req.session.destroy();
    res.redirect('/');
  }
}
