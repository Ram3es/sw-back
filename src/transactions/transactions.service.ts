import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { PinoLogger } from 'nestjs-pino';
import Dinero from 'dinero.js';
import {
  EPaymentOperation,
  EPaymentStatus,
  PAYOUT_LIMITS,
} from 'src/constants';
import { PayInWebhookDTO } from 'src/payments/dto/payin-webhook.dto';
import { ICreatePayoutTrx } from 'src/user/types/transactions';

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
  async payOutUserTransaction(
    trxData: ICreatePayoutTrx,
    chargedAmount: number,
    currentBalance: number,
  ) {
    const {
      id: transactionId,
      externalUserId,
      amount,
      status,
      method,
    } = trxData;

    const connection = await this.conn.getConnection();

    try {
      await connection.query('START TRANSACTION');
      const [lastBalance] = await connection.query(
        `SELECT newBalance FROM balance_history WHERE userId = ? ORDER BY id DESC LIMIT 1`,
        [externalUserId],
      );

      const historyBalance = lastBalance[0]?.newBalance;

      if (historyBalance && historyBalance !== currentBalance) {
        throw new HttpException('isn`t matched balance', HttpStatus.CONFLICT);
      }

      const currentUserBalance = Dinero({ amount: currentBalance });
      const holdTransaction = Dinero({ amount: chargedAmount });
      const newUserBalance = currentUserBalance.subtract(holdTransaction);

      await connection.query(
        `
      INSERT INTO balance_history (userId, prevBalance, newBalance, operation, extra )
      VALUES (?, ?, ?, ?, ?)
      `,
        [
          externalUserId,
          currentUserBalance.getAmount(),
          newUserBalance.getAmount(),
          EPaymentOperation.PAYOUT,
          transactionId,
        ],
      );

      await connection.query(
        `
      UPDATE users SET balance = ?
      WHERE id = ?
      `,
        [newUserBalance.getAmount(), externalUserId],
      );
      const [updatedBalance] = await connection.query(
        `SELECT balance FROM users WHERE id = ?
      `,
        [externalUserId],
      );

      await connection.query(
        `INSERT INTO user_transactions (userId, transactionId, type, amountTransaction, amountBalance , status, method)
         VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
          externalUserId,
          transactionId,
          EPaymentOperation.PAYOUT,
          amount,
          holdTransaction.getAmount(),
          status,
          method,
        ],
      );

      await connection.query('COMMIT');
      connection.release();
      return updatedBalance[0]?.balance;
    } catch (error) {
      this.logger.error(error);
      await connection.query('ROLLBACK');
      connection.release();
      throw new HttpException(error.message, error.status);
    }
  }

  async payInUserTransaction(body: PayInWebhookDTO) {
    const {
      id: trxId,
      externalUserId: userId,
      status,
      type,
      txid: cryptoTrx,
    } = body;
    try {
      const [trxRow] = await this.conn.query(
        `SELECT * FROM user_transactions WHERE transactionId = ? AND userId = ?`,
        [trxId, userId],
      );
      if (Array.isArray(trxRow) && !trxRow.length) {
        throw new HttpException('not found transaction', 404);
      }
      if (status === trxRow[0]?.status) {
        throw new HttpException(
          `Transaction already has status: ${status}`,
          409,
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }

    switch (status) {
      case EPaymentStatus.Complete:
        if (type === EPaymentOperation.PAYIN) {
          return this.successPayin(body);
        }
      case EPaymentStatus.Denied:
      case EPaymentStatus.Expired:
      case EPaymentStatus.Failed:
      case EPaymentStatus.Refunded:
      case EPaymentStatus.Processing:
        return this.updatePayinTransactionStatus(userId, trxId, status);
    }
  }

  private async successPayin(body: PayInWebhookDTO) {
    const { externalUserId, id: trxId, status: statusMs, amount } = body;
    const connection = await this.conn.getConnection();
    try {
      await connection.query('START TRANSACTION');
      const [userRow] = await connection.query(
        `SELECT balance, transactionsTotal, id as userId FROM users WHERE id = ?`,
        [Number(externalUserId)],
      );
      const { balance, userId } = userRow[0];

      const [historyRow] = await connection.query(
        `SELECT * FROM balance_history WHERE userId = ? ORDER BY date DESC LIMIT 1`,
        [userId],
      );

      if (historyRow[0] && historyRow[0]?.newBalance !== balance) {
        throw new HttpException('different amount of balance', 419);
      }

      const [trxRow] = await connection.query(
        `SELECT * FROM user_transactions WHERE transactionId = ? AND userId = ?`,
        [trxId, userId],
      );
      const { amountTransaction, amountBalance, status } = trxRow[0];

      if (amountTransaction !== amount || status === statusMs) {
        throw new HttpException(
          'no matched amount or status already applied',
          417,
        );
      }

      const currentBalance = Dinero({ amount: balance });
      const debit = Dinero({ amount: amountBalance });
      const newBalance = currentBalance.add(debit);

      await connection.query(
        `UPDATE user_transactions SET status = ? WHERE transactionId = ? AND userId = ?`,
        [statusMs, trxId, userId],
      );

      await connection.query(
        `INSERT INTO  balance_history (userId, prevBalance, newBalance, operation, extra )
           VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          balance,
          newBalance.getAmount(),
          EPaymentOperation.PAYIN,
          trxId,
        ],
      );
      await connection.query(`UPDATE users SET balance = ? WHERE id = ?`, [
        newBalance.getAmount(),
        userId,
      ]);
      await connection.query('COMMIT');
      connection.release();
      return { message: 'Ok', status: 201 };
    } catch (error) {
      this.logger.error(error);
      await connection.query('ROLLBACK');
      connection.release();
      throw new HttpException(error.message, error.status);
    }
  }

  private async updatePayinTransactionStatus(
    userId: string,
    trxId: string,
    status: string,
  ) {
    try {
      const [row] = await this.conn.query(
        `UPDATE user_transactions SET status = ? WHERE transactionId = ? AND userId = ?`,
        [status, trxId, userId],
      );
      return { message: 'Ok', status: 200 };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
