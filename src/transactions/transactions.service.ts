import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';
import Dinero from 'dinero.js';
import { PAYOUT_LIMITS } from 'src/constants';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('DB_CONNECTION') private conn: Pool,
    private readonly logger: PinoLogger,
  ) {}
  async payoutUserTransaction(steamId: string, payoutAmount: number) {
    const connection = await this.conn.getConnection();
    try {
      await connection.query('START TRANSACTION');
      const [rows] = await connection.query(
        `SELECT balance, transactionsTotal, id FROM users WHERE steamId = ?`,
        [steamId],
      );
      const { balance, transactionsTotal, id: userId } = rows[0];

      const [todayPayouts] = await connection.query(
        `SELECT SUM(prevBalance-newBalance) as 'total'
         FROM balance_history
         WHERE userId = ? AND date > now() - interval 1 day`,
        [userId],
      );

      const limitForToday = PAYOUT_LIMITS.DAILY - todayPayouts[0].total;

      if (payoutAmount > limitForToday) {
        throw new Error(
          `payout is too big. today limit - ${Dinero({
            amount: limitForToday,
          }).toFormat()}`,
        );
      }

      const currentTransactionsTotal = Dinero({ amount: transactionsTotal });
      const currentDailyLimit = Dinero({ amount: limitForToday });
      const currentBalance = Dinero({ amount: balance });
      const payout = Dinero({ amount: payoutAmount });

      const newBalance = currentBalance.subtract(payout);
      const newDailyLimit = currentDailyLimit.subtract(payout);
      const newTransactionsTotal = currentTransactionsTotal.add(payout);

      if (newBalance.isNegative()) {
        throw new Error('Funds insufficient.');
      }

      await connection.query(
        `UPDATE users SET balance = ?, transactionsTotal = ? WHERE id = ?`,
        [newBalance.getAmount(), newTransactionsTotal.getAmount(), userId],
      );

      const [{ insertId }]: any = await connection.query(
        `
          INSERT INTO balance_history (userId, prevBalance, newBalance, operation, extra)
          VALUES (?, ?, ?, ?, ?)
        `,
        [userId, balance, newBalance.getAmount(), 'payout', 'some extra info'],
      );

      const [entity] = await connection.query(
        `SELECT prevBalance, newBalance, operation FROM balance_history WHERE id = ?`,
        [insertId],
      );

      await connection.query('COMMIT');
      connection.release();
      entity[0].daily_limit = newDailyLimit.getAmount();
      return entity[0];
    } catch (error) {
      this.logger.error(error);
      await connection.query('ROLLBACK');
      connection.release();
      throw new BadRequestException(error.message, error);
    }
  }
}
