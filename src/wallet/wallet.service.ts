import {
  HttpException,
  Inject,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
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
import { PayoutDTO } from './dto/payin.dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logger: PinoLogger,
    @Inject('DB_CONNECTION') private conn: Pool,
  ) {}

  async makePayIn(steamId: string, body: PayoutDTO) {
    const [row] = await this.conn.query(
      `SELECT id, balance FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId } = row[0];
    const payinBodyApi = {
      ...body,
      externalUserId: String(userId),
      checkout: {
        productName: 'Example Coinbase Payin',
        productDescription: '$10.00 Example Coinbase Payin',
        successUrl: 'http://example.com/success',
        cancelUrl: 'http://example.com/cancel',
      },
    };
    try {
      const { data } = await this.paymentsService.paymentsAPIrequest(
        'payin',
        payinBodyApi,
      );

      const {
        id: transactionId,
        amount,
        method,
        status,
        externalUserId,
      } = data;

      if (Number(externalUserId) !== userId) {
        throw new BadRequestException('Bad request');
      }

      await this.conn.query(
        `INSERT INTO user_transactions (userId, transactionId, type, amount, status, method)
         VALUES(?, ?, ?, ?, ?, ?)`,
        [
          userId,
          transactionId,
          EPaymentOperation.PAYIN,
          amount,
          status,
          method,
        ],
      );
      
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async reedeemCardTransaction(steamId: string, body: RedeemDTO) {
    const [row] = await this.conn.query(
      `SELECT id, balance FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId, balance } = row[0];
    const redeemData = { ...body, externalUserId: String(userId || 1) };
    const card = await this.paymentsService.redeemGiftCard(redeemData);

    if (card instanceof Error) {
      throw new BadRequestException('invalid redeem card');
    }

    if (userId && card) {
      const connection = await this.conn.getConnection();
      try {
        await connection.query('START TRANSACTION');
        const [lastRow] = await connection.query(
          `SELECT * FROM balance_history WHERE userId = ? ORDER BY date DESC LIMIT 1`,
          [userId],
        );

        if (lastRow[0] && lastRow[0]?.newBalance !== balance) {
          throw new HttpException('different amount of balance', 503);
        }

        const currentBalance = Dinero({ amount: balance });
        const debit = Dinero({ amount: card.value });
        const newBalance = currentBalance.add(debit);

        await connection.query(
          `INSERT INTO  balance_history (userId, prevBalance, newBalance, operation, extra )
             VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            balance,
            newBalance.getAmount(),
            EPaymentOperation.PAYIN,
            card.code,
          ],
        );

        await connection.query(`UPDATE users SET balance = ? WHERE id = ?`, [
          newBalance.getAmount(),
          userId,
        ]);
        await connection.query(
          `INSERT INTO user_transactions (userId, transactionId, type, amount, status, method)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            card.code,
            EPaymentOperation.PAYIN,
            card.value,
            EPaymentStatus.Complete,
            EPaymentMethod.Redeem,
          ],
        );
        await connection.query('COMMIT');
        connection.release();
        return card;
      } catch (error) {
        this.logger.error(error);
        await connection.query('ROLLBACK');
        connection.release();
      }
    }
  }
}
