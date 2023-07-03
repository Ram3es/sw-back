import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  steamLogin({ query, request }) {
    console.log('steamLogin', query);
    console.log('steamLogin', request);
  }
}
