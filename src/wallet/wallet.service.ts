import {
  HttpException,
  Inject,
  Injectable,
  BadRequestException,
  HttpStatus,
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
import { PayinDTO } from './dto/payin.dto';
import { PayoutDTO } from './dto/payout.dto';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from 'src/transactions/transactions.service';
import { PAYMENT_ERRORS } from 'src/constants/error-payment-service';

@Injectable()
export class WalletService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionService: TransactionsService,
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject('DB_CONNECTION') private conn: Pool,
  ) {}

  async makePayIn(steamId: string, body: PayinDTO) {
    const [row] = await this.conn.query(
      `SELECT id, balance FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId } = row[0];
    const CLIENT = this.configService.get('FRONTEND_URL');
    const { balanceAmount, ...bodyMs } = body;
    const payinBodyApi = {
      ...bodyMs,
      externalUserId: String(userId),
      checkout: {
        productName: 'Skinwallet Site Balance',
        productDescription: 'Skinwallet Site Balance',
        successUrl: `${CLIENT}/market`,
        cancelUrl: `${CLIENT}/wallet`,
      },
    };
    try {
      const { data } = await this.paymentsService.paymentsAPIrequest(
        EPaymentOperation.PAYIN,
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
        `INSERT INTO user_transactions (userId, transactionId, type, amountTransaction, amountBalance , status, method)
         VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          transactionId,
          EPaymentOperation.PAYIN,
          amount,
          balanceAmount,
          status,
          method,
        ],
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      const statusMsg = error?.response?.data?.message;
      throw new BadRequestException(
        PAYMENT_ERRORS.payin[statusMsg] || 'Something went wrong',
      );
    }
  }

  async makePayOut(steamId: string, body: PayoutDTO) {
    const [row] = await this.conn.query(
      `SELECT id, balance FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId, balance: currentUserBalance } = row[0];

    if (currentUserBalance < body.balanceAmount) {
      throw new BadRequestException('Not enougth balance');
    }

    let payoutBodyApi: Record<string, any> = {
      method: body.method,
      amount: body.amount,
      address: body.walletAddress,
      externalUserId: userId.toString(),
    };

    //added metadata for paypal venmo method required
    if (['paypal', 'venmo'].includes(body.method)) {
      payoutBodyApi = {
        ...payoutBodyApi,
        metadata: {
          subject: 'Payout from SkinSwap',
          message: 'Thanks for using Skinswap! Enjoy your payout!',
          note: 'Thanks for using Skinswap! Enjoy your payout!',
        },
      };
    }

    try {
      const { data } = await this.paymentsService.paymentsAPIrequest(
        EPaymentOperation.PAYOUT,
        payoutBodyApi,
      );
      const newUserBalance =
        await this.transactionService.payOutUserTransaction(
          data,
          body.balanceAmount,
          currentUserBalance,
        );

      return {
        ...data,
        balance: newUserBalance,
      };
    } catch (error) {
      this.logger.error(error);
      const statusMsg = error?.response?.data?.message;
      throw new BadRequestException(
        PAYMENT_ERRORS.payin[statusMsg] || 'Something went wrong',
      );
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
          `INSERT INTO user_transactions (userId, transactionId, type, amountTransaction, amountBalance, status, method)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            card.code,
            EPaymentOperation.PAYIN,
            card.value,
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
        throw new HttpException(error.message, error.status);
      }
    }
  }
  async getUserWalletsById(steamId: string) {
    const [wallets] = await this.conn.query(
      `SELECT id, wallet AS walletAddress, currency AS method FROM user_crypto_wallets WHERE (SELECT id FROM users WHERE steamId = ?)`,
      [steamId],
    );
    return wallets;
  }
}
