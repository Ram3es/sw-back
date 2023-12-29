import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { TransactionsService } from 'src/transactions/transactions.service';
import { Pool } from 'mysql2/promise';
import { PAYOUT_LIMITS } from 'src/constants';
import Dinero from 'dinero.js';
import { RedeemCardDTO } from './dto/redeem-card.dto';
import crypto from 'crypto';
import { TRANSACTION_FILTERS } from './constants/transaction-filters';

const ENDPOINTS = new Map();
ENDPOINTS.set('methods', {
  url: '/api/management/payments',
  method: 'GET',
});
ENDPOINTS.set('payout', {
  url: '/api/payments/payout',
  method: 'POST',
});
ENDPOINTS.set('payin', {
  url: '/api/payments/payin',
  method: 'POST',
});
ENDPOINTS.set('redeem-giftcard', {
  url: '/api/giftcard/redeem',
  method: 'POST',
});

@Injectable()
export class PaymentsService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private readonly transactions: TransactionsService,
    @Inject('DB_CONNECTION') private conn: Pool,
  ) {}
  async getPaymentMethods() {
    try {
      const { data } = await this.paymentsAPIrequest('methods');
      return data;
    } catch (error) {
      this.logger.info(error);
    }
  }

  // async makePayout(payload: { steamId: string; amount: number }) {
  //   const { steamId, amount } = payload;
  //   const payout = await this.transactions.payoutUserTransaction(
  //     steamId,
  //     amount,
  //   );
  //   return payout;
  //   try {
  //     const res = await this.paymentsAPIrequest('payout', payload);
  //     return res;
  //   } catch (error) {
  //     this.logger.info(error);
  //   }
  // }

  async redeemGiftCard(body: RedeemCardDTO) {
    try {
      const { data } = await this.paymentsAPIrequest('redeem-giftcard', body);
      return data;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  async getTransactions(steamId: string, filter?: string) {
    const [groupedTrx]: any = await this.conn.query(
      `
    SELECT type, COUNT(*) as total FROM user_transactions 
    WHERE userId = (SELECT id FROM users WHERE steamId = ?)
    GROUP BY type
    `,
      [steamId],
    );

    const [totalAmount]: any = await this.conn.query(
      `
    SELECT COUNT(*) as total FROM user_transactions 
    WHERE userId = (SELECT id FROM users WHERE steamId = ?)
    `,
      [steamId],
    );

    let transactions: any;

    if (filter) {
      const [data] = await this.conn.query(
        `SELECT * FROM user_transactions 
         WHERE type IN (?)
         AND userId IN (SELECT id as userId FROM users WHERE steamId = ?)
        `,
        [filter.split(','), steamId],
      );
      transactions = data
    } else {
      const [data] = await this.conn.query(
        `SELECT * FROM user_transactions WHERE userId IN (SELECT id as userId FROM users WHERE steamId = ?)`,
        [steamId],
      );
      transactions = data
    }

    const defaultFilters = !groupedTrx.length
      ? TRANSACTION_FILTERS
      : TRANSACTION_FILTERS.map((ftr) => {
          if (ftr.name === 'type') {
            return {
              ...ftr,
              options: ftr.options.map((option) => ({
                ...option,
                count:
                  groupedTrx.find((val) => val.type === option.value)?.total ??
                  0,
              })),
            };
          }
          return ftr;
        });

    return {
      data: transactions,
      defaultFilters,
      total: totalAmount[0]?.total ?? 0
    };
  }

  async getDailyLimitsByUser(steamId: string) {
    const [rows] = await this.conn.query(
      `SELECT id FROM users WHERE steamId = ?`,
      [steamId],
    );
    const { id: userId } = rows[0];

    const [todayPayouts] = await this.conn.query(
      `SELECT SUM(prevBalance-newBalance) as 'total'
       FROM balance_history
       WHERE userId = ? AND date > now() - interval 1 day`,
      [userId],
    );
    const limitForToday = PAYOUT_LIMITS.DAILY - todayPayouts[0].total;
    return Dinero({ amount: limitForToday }).getAmount();
  }

  async paymentsAPIrequest(endpoint: string, payload?: object) {
    const baseURL = this.configService.get('PAYMENTS_API_HOST');
    const { url, method } = ENDPOINTS.get(endpoint);

    try {
      const { data } = await this.httpService.axiosRef({
        baseURL,
        url,
        method,
        headers: {
          'x-api-key': this.configService.get('PAYMENTS_API_KEY'),
        },
        data: payload,
      });

      return data;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  public checkWebhookHash(hash: string) {
    const API_KEY = this.configService.get('PAYMENTS_API_KEY');
    const apiKeyHash = crypto
      .createHash('sha256')
      .update(API_KEY)
      .digest('hex');

    return apiKeyHash === hash;
  }
}
