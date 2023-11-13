import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PaymentsService } from 'src/payments/payments.service';
import { RedeemDTO } from './dto/redeem.dto';
import { Pool } from 'mysql2/promise';
import Dinero from 'dinero.js';
import {
  EPaymentMethod,
  EPaymentOperation,
  EPaymentStatus,
} from 'src/constants';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class WalletService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logger: PinoLogger,
    @Inject('DB_CONNECTION') private conn: Pool,
  ) {}

  async reedeemCardTransaction(steamId: string, body: RedeemDTO) {
    const [row] = await this.conn.query(
      `SELECT id, balance FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId, balance } = row[0];
    const redeemData = { ...body, externalUserId: String(userId || 1) };
    const card = await this.paymentsService.redeemGiftCard(redeemData);

    if (userId && card) {
      const connection = await this.conn.getConnection();
      try {
        await connection.query('START TRANSACTION');
        const [lastRow] = await connection.query(
          `SELECT * FROM balance_history WHERE userId = ? ORDER BY date DESC LIMIT 1`,
          [userId],
        );

        const currentBalance = Dinero({ amount: balance });
        const debit = Dinero({ amount: card.value });
        const newBalance = currentBalance.add(debit);

        if (lastRow[0] && lastRow[0]?.newBalance !== balance) {
          throw new HttpException('different amount of balance', 503);
        }
        await connection.query(
          `INSERT INTO  balance_history (userId, prevBalance, newBalance, operation, status, method, extra )
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            balance,
            newBalance.getAmount(),
            EPaymentOperation.PAYIN,
            EPaymentStatus.Complete,
            EPaymentMethod.Redeem,
            card.code,
          ],
        );

        await connection.query(`UPDATE users SET balance = ? WHERE id = ?`, [
          newBalance.getAmount(),
          userId,
        ]);
        await connection.query('COMMIT');
        connection.release();
        return card
      } catch (error) {
        this.logger.error(error);
        await connection.query('ROLLBACK');
        connection.release();
      }
    }
  }
}
