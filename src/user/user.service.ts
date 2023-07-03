import { Injectable, Inject } from '@nestjs/common';
import { DBUser, User } from './types';
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
      steam_id,
      steam_username,
      avatar_url,
      profile_url,
      payout_ok,
      banned,
      balance,
    } = user;
    return {
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
