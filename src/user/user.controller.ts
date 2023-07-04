import { Controller, Get, Req, Session, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SteamAuthGuard } from 'src/auth/steam.guard';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  me(@Session() session: Record<string, any>, @Req() req: any) {
    console.log('me', session);
    return req?.user;
  }
}
