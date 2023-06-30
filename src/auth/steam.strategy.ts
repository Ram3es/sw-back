import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-steam';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SteamStrategy extends PassportStrategy(Strategy, 'steam') {
  constructor() {
    super(
      {
        returnURL: `${process.env.APP_URL}/auth/steam/verify`,
        realm: process.env.APP_URL,
        apiKey: process.env.STEAM_API_KEY,
      },
      (identifier, profile, done) => {
        process.nextTick(() => {
          profile.identifier = identifier;
          return done(null, profile);
        });
      },
    );
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    console.log('profile', profile);
    // done(null, user);
  }
}
