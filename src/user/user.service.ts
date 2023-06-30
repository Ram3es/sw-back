import { Injectable, Inject } from '@nestjs/common';
import { User } from './types';

@Injectable()
export class UserService {
  constructor(@Inject('DB_CONNECTION') private conn: any) {}

  async findAll() {
    const [data] = await this.conn.query('SELECT * FROM user');
    console.log(data);
    return data;
  }

  async findBySteamId(steamId: string): Promise<User> {
    const [data] = await this.conn.query(
      `SELECT * FROM user WHERE steam_id = ?`,
      [steamId],
    );
    return data;
  }
}
