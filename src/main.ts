import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LoggerErrorInterceptor, PinoLogger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { SteamAuthGuard } from './auth/steam.guard';

async function bootstrap() {
  console.log(
    'Starting application...',
    process.env.NODE_ENV === 'production' ? 'production' : 'development',
  );
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      name: process.env.SESSION_NAME,
      resave: true,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days cookies
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  // app.useGlobalGuards(new SteamAuthGuard());
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
