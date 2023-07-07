import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { PayoutDTO } from './dto/payments.dto';

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
  ) {}
  async getPaymentMethods() {
    try {
      const { data } = await this.paymentsAPIrequest('methods');
      return data;
    } catch (error) {
      this.logger.info(error);
    }
  }

  async makePayout(payload: PayoutDTO) {
    try {
      const res = await this.paymentsAPIrequest('payout', payload);
      return res;
    } catch (error) {
      this.logger.info(error);
    }
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