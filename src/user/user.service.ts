import { Injectable, Inject } from '@nestjs/common';
import { DBUser, User } from './types';
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
    return data.map((user: DBUser) => this.mapDbToUser(user));
  }

  async findBySteamId(steamId: string): Promise<User> {
    const [data] = await this.conn.query(
      `SELECT * FROM users WHERE steam_id = ?`,
      [steamId],
    );
    return data.length ? this.mapDbToUser(data[0]) : null;
  }

  async create(user: User): Promise<void> {
    const { steam_id, steam_username, profile_url, avatar_url } =
      this.mapUserToDb(user);
    await this.conn.query(
      `INSERT INTO users (steam_id, steam_username, avatar_url, profile_url) VALUES (?, ?, ?, ?)`,
      [steam_id, steam_username, avatar_url, profile_url],
    );
  }

  async update(user: User): Promise<void> {
    const { steam_id, steam_username, avatar_url, profile_url } =
      this.mapUserToDb(user);
    await this.conn.query(
      `UPDATE users SET steam_username = ?, avatar_url = ?, profile_url = ? WHERE steam_id = ?`,
      [steam_username, avatar_url, profile_url, steam_id],
    );
  }

  async getUserBalanceHistory(user_id: number) {
    try {
      const [history] = await this.conn.query(
        `SELECT
          prev_balance,
          new_balance,
          new_balance-prev_balance AS 'difference',
          operation,
          extra,
          date
        FROM balance_history
        WHERE user_id = ?;`,
        [user_id],
      );
      return history;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private mapUserToDb(user: User): DBUser {
    const {
      steamId,
      steamUsername,
      profileUrl,
      avatarUrl,
      payoutOk,
      banned,
      balance,
    } = user;
    return {
      steam_id: steamId,
      steam_username: steamUsername,
      avatar_url: avatarUrl,
      profile_url: profileUrl,
      payout_ok: payoutOk,
      banned,
      balance,
    };
  }

  private mapDbToUser(user: DBUser): User {
    const {
      id,
      steam_id,
      steam_username,
      avatar_url,
      profile_url,
      payout_ok,
      banned,
      balance,
    } = user;
    return {
      id,
      steamId: steam_id,
      steamUsername: steam_username,
      avatarUrl: avatar_url,
      profileUrl: profile_url,
      payoutOk: payout_ok,
      banned,
      balance,
    };
  }
}
