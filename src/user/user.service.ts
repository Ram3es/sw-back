import { Injectable, Inject } from '@nestjs/common';
import { CreateUser, User } from './types';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    @Inject('DB_CONNECTION') private conn: any,
    private readonly logger: PinoLogger,
  ) {}

  async findAll(): Promise<User[]> {
    const [data] = await this.conn.query('SELECT * FROM users');
    this.logger.info('foo');
    return data;
  }

  async findBySteamId(steamId: string): Promise<User> {
    const [data] = await this.conn.query(
      `SELECT * FROM users WHERE steamId = ?`,
      [steamId],
    );
    return data.length ? data[0] : null;
  }

  async create(user: CreateUser): Promise<void> {
    const { steamId, steamUsername, profileUrl, avatarUrl } = user;
    await this.conn.query(
      `INSERT INTO users (steamId, steamUsername, avatarUrl, profileUrl) VALUES (?, ?, ?, ?)`,
      [steamId, steamUsername, avatarUrl, profileUrl],
    );
  }

  async update(user: User): Promise<void> {
    const { steamId, steamUsername, avatarUrl, profileUrl } = user;
    await this.conn.query(
      `UPDATE users SET steamUsername = ?, avatarUrl = ?, profileUrl = ? WHERE steamId = ?`,
      [steamUsername, avatarUrl, profileUrl, steamId],
    );
  }

  async getUserBalanceHistory(userId: number) {
    try {
      const [history] = await this.conn.query(
        `SELECT
          prevBalance,
          newBalance,
          newBalance-prevBalance AS 'difference',
          operation,
          extra,
          date
        FROM balance_history
        WHERE userId = ?;`,
        [userId],
      );
      return history;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
