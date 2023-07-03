import { Injectable, Inject } from '@nestjs/common';
import { User } from './types';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    @Inject('DB_CONNECTION') private conn: any,
    private readonly logger: PinoLogger,
  ) {}

  async findAll() {
    const [data] = await this.conn.query('SELECT * FROM users');
    this.logger.info('foo');
    return data;
  }

  async findBySteamId(steamId: string): Promise<User> {
    const [data] = await this.conn.query(
      `SELECT * FROM users WHERE steam_id = ?`,
      [steamId],
    );
    return data;
  }
}
