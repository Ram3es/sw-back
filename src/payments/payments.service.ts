import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { PayoutDTO } from './dto/payments.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import * as transactions from './mocks/transactions.json';
import { Pool } from 'mysql2/promise';
import { PAYOUT_LIMITS } from 'src/constants/inxex';
import Dinero from 'dinero.js';

const ENDPOINTS = new Map();
ENDPOINTS.set('methods', {
  url: '/api/management/getPaymentMethods',
  method: 'GET',
});
ENDPOINTS.set('payout', {
  url: '/api/payments/payout',
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

  async makePayout(payload: { steamId: string; amount: number }) {
    const { steamId, amount } = payload;
    const payout = await this.transactions.payoutUserTransaction(
      steamId,
      amount,
    );
    return payout;
    // try {
    //   const res = await this.paymentsAPIrequest('payout', payload);
    //   return res;
    // } catch (error) {
    //   this.logger.info(error);
    // }
  }

  getTransactions() {
    return transactions;
  }

  async getDailyLimitsByUser(steamId: string) {
    const [rows] = await this.conn.query(
      `SELECT id FROM users WHERE steam_id = ?`,
      [steamId],
    );
    const { id: userId } = rows[0];

    const [todayPayouts] = await this.conn.query(
      `SELECT SUM(prev_balance-new_balance) as 'total'
       FROM balance_history
       WHERE user_id = ? AND date > now() - interval 1 day`,
      [userId],
    );
    const limitForToday = PAYOUT_LIMITS.DAILY - todayPayouts[0].total;
    return Dinero({ amount: limitForToday }).getAmount();
  }

  private async paymentsAPIrequest(endpoint: string, payload?: object) {
    const baseURL = this.configService.get('PAYMENTS_API_HOST');
    const { url, method } = ENDPOINTS.get(endpoint);

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
  }
}
