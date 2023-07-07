import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { SteamAuthGuard } from './steam.guard';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { Request } from 'express';

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
    const continueUrl = req?.session?.continueUrl;
    console.log('continueUrl', continueUrl);
    await this.authService.steamLogin(req);
    delete req.session.continueUrl;
    res.redirect(continueUrl || '/');
  }

  @Public()
  @Get('logout')
  logout(@Res() res, @Req() req: any) {
    req.session.destroy();
    res.redirect('/');
  }
}
