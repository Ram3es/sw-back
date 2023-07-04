import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor(private readonly userService: UserService) {
    super(
      {
        returnURL: `${process.env.APP_URL}/auth/steam/verify`,
        realm: process.env.APP_URL,
        apiKey: process.env.STEAM_API_KEY,
      },
      async (identifier, profile, done) => {
        profile.identifier = identifier;
        const user = await this.userService.findBySteamId(profile.id);
        console.log('SteamStrategy user', user);
        console.log('SteamStrategy', profile);
        console.log('SteamStrategy', identifier);
        return done(null, user);
      },
    );
  }
  verify(req, user) {
    console.log('SteamStrategy str', user);
    console.log('SteamStrategy str', req);
    return true;
  }
}
