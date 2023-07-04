import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
  ) {}

  async steamLogin(req) {
    console.log('steamLogin', req.user);
    const { steamId, steamUsername, avatarUrl, profileUrl } = req.user;
    this.logger.debug(
      'steamLogin',
      steamId,
      steamUsername,
      profileUrl,
      avatarUrl,
    );

    // check if user exists
    const user = await this.userService.findBySteamId(steamId);
    // if user exists, update user
    if (user) {
      this.logger.info('user exists', steamId);
      await this.userService.update({
        ...user,
        steamId,
        steamUsername,
        profileUrl,
        avatarUrl,
      });
    } else {
      // if user does not exist, create user
      this.logger.info('user does not exist', steamId);
      await this.userService.create({
        steamId,
        steamUsername,
        profileUrl,
        avatarUrl,
      });
    }
  }
}
