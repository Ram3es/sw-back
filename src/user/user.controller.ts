import { Controller, Get, Req, Session } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  async me(@Session() session: Record<string, any>, @Req() req: any) {
    const steamId = String(req?.user?._json?.steamid);
    const user = await this.userService.findBySteamId(steamId);
    return user;
  }
}
