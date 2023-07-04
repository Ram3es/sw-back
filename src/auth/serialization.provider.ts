import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from './auth.service';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }
  serializeUser(user, done) {
    console.log('serializeUser', user);
    done(null, user);
  }

  deserializeUser(obj, done) {
    console.log('deserializeUser', obj);
    done(null, obj);
  }
}
