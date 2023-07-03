import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { SteamStrategy } from './steam.strategy';

@Module({
  providers: [AuthService, SteamStrategy],
  imports: [UserModule, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
