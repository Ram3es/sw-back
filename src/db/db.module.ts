import { Module } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

const dbProvider = {
  provide: 'DB_CONNECTION',
  useFactory: async (configService: ConfigService) => {
    const host = configService.get<string>('DB_HOST');
    const user = configService.get<string>('DB_USER');
    const password = configService.get<string>('DB_PASSWORD');
    const database = configService.get<string>('DB_DATABASE');
    const port = configService.get<string>('DB_PORT');
    console.log(host);
    console.log(user);
    console.log(database);
    console.log(port);

    const pool = await mysql.createPool({
      host,
      user,
      password,
      database,
      port: Number.parseInt(port),
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    return pool;
  },
  // useValue: pool,
  inject: [ConfigService],
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
