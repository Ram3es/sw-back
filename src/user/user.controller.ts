import { Controller, Get, Req, Session } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get('me')
  me(@Session() session: Record<string, any>, @Req() req: any) {
    return req?.user;
  }
}
