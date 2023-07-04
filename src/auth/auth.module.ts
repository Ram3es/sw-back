import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { SteamStrategy } from './steam.strategy';
import { AuthSerializer } from './serialization.provider';

@Module({
  providers: [AuthService, SteamStrategy, AuthSerializer],
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: 'steam',
      session: true,
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
