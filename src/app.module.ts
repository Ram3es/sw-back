import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { validate } from './env.validation';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from 'nestjs-pino';
import * as pino from 'pino';
import pretty from 'pino-pretty';
import * as fs from 'fs';
import { PaymentsModule } from './payments/payments.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticatedGuard } from './auth/authenticated.guard';

const LOGDIR = './logs';

// check if log directory exists
if (!fs.existsSync(LOGDIR)) {
  // create the log directory
  fs.mkdirSync(LOGDIR);
}
const multi = [
  pretty({
    colorize: true,
    colorizeObjects: true,
    ignore: 'pid,hostname',
  }),
  pino.destination({
    dest: `${LOGDIR}/app.log`,
  }),
];
@Module({
  imports: [
    DbModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        autoLogging: {
          ignore: function (req) {
            return req.statusCode < 400;
          },
        },
        stream: pino.multistream(multi),
      },
    }),
    UserModule,
    AuthModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
  ],
})
export class AppModule {}
