import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class BalanceService {
  constructor(@Inject('DB_CONNECTION') private conn: any) {}
  async test() {
    await this.conn.query(
      `INSERT INTO balance_history (user_id, prev_balance, new_balance, operation) VALUES (?, ?, ?, ?)`,
      [1, 100, 79.22, 'payout'],
    );
    const [res] = await this.conn.query(`select * from balance_history`);
    return res;
  }
}
