import { ConfigService } from '@nestjs/config';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ENDPOINTS } from './constants/endpoints';
import { PinoLogger } from 'nestjs-pino';
import qs from 'qs';
import { Pool } from 'mysql2/promise';
import { CreateTradeDto } from './dto/create-trade.dto';

@Injectable()
export class SteamService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
    @Inject('DB_CONNECTION') private conn: Pool,
  ) {}

  async createTradeOffer(steamId: string, body: CreateTradeDto) {
    const [row] = await this.conn.query(
      `SELECT tradeUrl FROM users WHERE steamId = ?
    `,
      [steamId],
    );
    const { tradeUrl } = row[0];
    const tradePayload = {
      steamId: '765611988737959', //user steamId
      tradeUrl:
        'https://steamcommunity.com/tradeoffer/new/?partner=893472231&token=WsJBhgDB', //trade Url
      theirItems: [],
      ourItems: body.tradeItems,
      message: 'Thanks for trading with SkinSwap!',
    };
    const { url, method } = ENDPOINTS.get('create-trade');
    const query = url.replace(':steamId', '76561198392185014'); // bot steamId

    try {
      const { data: trade } = await this.fetchSteamMicroservice(
        query,
        method,
        tradePayload,
      );
      await this.conn.query(
        `
      INSERT INTO user_trade_offers (steamId, tradeId, tradeOfferId, state)
      VALUES (?, ?, ?, ?)
      `,
        [steamId, trade.id, trade.tradeofferid, trade.state],
      );

      for await (const item of body.tradeItems) {
        await this.conn.query(
          `
          UPDATE user_items
          SET withdrawn = 1, transactionId = ?
          WHERE userId = ? AND assetId = ?
        `,
          [trade.id, steamId, item.assetid],
        );
      }

      console.log(trade);
      return trade;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async getTradeHoldDuration(steamId: string) {
    const [row] = await this.conn.query(
      `SELECT tradeUrl FROM users WHERE steamId = ?
    `,
      [steamId],
    );
    const query = {
      steamId,
      tradeUrl: row[0]?.tradeUrl,
    };
    const { url, method } = ENDPOINTS.get('get-tradehold');
    const params = qs.stringify(query, { addQueryPrefix: true });
    try {
      await this.fetchSteamMicroservice(url.concat(params), method);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async fetchInventory(params?: string) {
    const { url, method } = ENDPOINTS.get('get-inventory');
    return this.fetchSteamMicroservice(url.concat(params ?? ''), method);
  }

  async manageTrade(body: any) {
    console.log(body)
    return { status: 201, message: 'Ok' };
  }

  private async fetchSteamMicroservice(
    url: string,
    method: string,
    payload?: object,
  ) {
    const baseURL = this.configService.get('STEAM_FARM_API_HOST');
    const API_KEY = this.configService.get('STEAM_FARM_API_KEY');

    const resp = await this.httpService.axiosRef({
      baseURL,
      method,
      url,
      headers: {
        'x-api-key': API_KEY,
      },
      data: payload,
    });

    return resp.data;
  }
}
