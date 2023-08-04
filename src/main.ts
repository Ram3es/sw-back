import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import MySQLStore from 'express-mysql-session';
import { truncate } from 'fs';

const mySQLStore = MySQLStore(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.log(
    `STARTING APP... MODE: ${
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    } ${2}`,
  );

  // init mysql table sessions as session store
  const mysqlSessionStoreOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    clearExpired: true,
    expiration: 1000 * 60 * 60 * 24 * 2,
    createDatabaseTable: true,
  };
  const sessionStore = new mySQLStore(mysqlSessionStoreOptions);

  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      name: process.env.SESSION_NAME,
      resave: true,
      saveUninitialized: false,
      store: sessionStore,
      proxy: process.env.NODE_ENV === 'production',
      cookie: {
        secure: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days cookies
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(7000);
}
bootstrap();
