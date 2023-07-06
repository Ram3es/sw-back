import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('DB_CONNECTION') private conn: Pool,
    private readonly logger: PinoLogger,
  ) {}
  async payoutUserTransaction(user_id: number, payoutAmount: number) {
    const connection = await this.conn.getConnection();
    try {
      await connection.query('START TRANSACTION');
      const [rows] = await connection.query(
        `SELECT balance FROM users WHERE id = ?`,
        [user_id],
      );
      const { balance } = rows[0];

      const new_balance = Number(balance) + Number(payoutAmount);

      await connection.query(`UPDATE users SET balance = ? WHERE id = ?`, [
        new_balance,
        user_id,
      ]);

      const [{ insertId }]: any = await connection.query(
        `
          INSERT INTO balance_history (user_id, prev_balance, new_balance, operation, extra)
          VALUES (?, ?, ?, ?, ?)
        `,
        [user_id, balance, new_balance, 'payout', 'some extra info'],
      );

      const [entity] = await connection.query(
        `SELECT * FROM balance_history WHERE id = ?`,
        [insertId],
      );

      await connection.query('COMMIT');
      connection.release();
      return entity[0];
    } catch (error) {
      this.logger.error(error);
      await connection.query('ROLLBACK');
      connection.release();
    }
  }
}
