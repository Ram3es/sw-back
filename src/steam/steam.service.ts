import { InventoryService } from './../inventory/inventory.service';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ENDPOINTS } from './constants/endpoints';
import { PinoLogger } from 'nestjs-pino';
import qs from 'qs';
import { Pool } from 'mysql2/promise';
import { MakeTradeOfferDTO } from './dto/make-trade.dto';

@Injectable()
export class SteamService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger,
    @Inject('DB_CONNECTION') private conn: Pool,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
  ) {}

  async createTradeOffer(steamId: string, tradeId: string) {
    const [row] = await this.conn.query(
      `
    SELECT tradeUrl FROM users WHERE steamId = ?
    `,
      [steamId],
    );

    const [dataBotId] = await this.conn.query(
      `
    SELECT ba.botSteamId as botId
    FROM user_trade_offers as uto
    LEFT JOIN bot_accounts as ba ON ba.id = uto.botId
    WHERE tradeId = ?
    `,
      [tradeId],
    );

    //temporary getting items from tradeOffer
    const [itemsInTrade]: any = await this.conn.query(
      `
    SELECT appId as appid, assetId as assetid, amount
    FROM trade_items
    WHERE tradeId = ?
    `,
      [tradeId],
    );
    // ---- end getting items -----

    const botId = dataBotId[0]?.botId;
    const tradeUrl = row[0]?.tradeUrl;

    const transportData = {
      steamId,
      tradeUrl,
      theirItems: [],
      ourItems: itemsInTrade,
      message: 'Thanks for trading with SkinSwap!',
    };

    const { url, method } = ENDPOINTS.get('create-trade');
    const query = url.replace(':steamId', botId);

    try {
      const { data } = await this.fetchSteamMicroservice(
        query,
        method,
        transportData,
      );

      console.log(
        data,
        '[CREATED TRADE]=====================>>>>>>>>>>>>>>>>>>>>>',
      );

      const { tradeofferid, state, id } = data;
      await this.conn.query(
        `
        UPDATE user_trade_offers
        SET tradeOfferId = ?, state = ?
        WHERE tradeId = ?
        `,
        [tradeofferid, state, id],
      );
      const userTradeOffers = await this.inventoryService.allActiveTrades(
        steamId,
      );
      return userTradeOffers;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async makeTradeOffer(steamId: string, { tradeItems }: MakeTradeOfferDTO) {
    try {
      const [data] = await this.conn.query(
        `
        SELECT tradeUrl 
        FROM users
        WHERE steamId = ? 
      `,
        [steamId],
      );
      const tradeUrl = data[0]?.tradeUrl;
      const transportData = {
        message: 'Thanks for trading with SkinSwap!',
        steamId,
        tradeUrl,
        theirItems: [],
        ourItems: tradeItems,
      };

      const { url, method } = ENDPOINTS.get('make-trade');

      const {
        data: { trades, backpack },
      } = await this.fetchSteamMicroservice(url, method, transportData);

      for await (const trade of trades) {
        const [rows] = await this.conn.query(
          `
          SELECT id FROM bot_accounts
          WHERE botSteamId = ?
          `,
          [trade.account.steamid],
        );

        let botExistId = rows[0]?.id;

        if (!botExistId) {
          const { steamid, name, avatarHash, memberSince, level } =
            trade?.account;
          const [{ insertId }]: any = await this.conn.query(
            `
            INSERT INTO bot_accounts (botSteamId, name, avatarHash, memberSince, level)
            VALUES (?, ?, ?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), ?)
            `,
            [steamid, name, avatarHash, memberSince, level],
          );

          botExistId = insertId;
        }
        await this.conn.query(
          `
          INSERT INTO user_trade_offers (steamId, tradeId, botId, state)
          VALUES (?, ?, ?, ?)`,
          [steamId, trade.id, botExistId, trade.state],
        );

        for await (const item of trade.ourItems) {
          const { appid, assetid, amount, icon_url, name } = item;
          await this.conn.query(
            `
              INSERT INTO trade_items (tradeId, appId, assetId, amount, name, iconUrl)
              VALUES (?, ?, ?, ?, ?, ?)`,
            [trade.id, appid, assetid, amount, name, icon_url],
          );
        }
      }
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getTradeHoldDuration(steamId: string) {
    try {
      const [row] = await this.conn.query(
        `SELECT tradeUrl FROM users WHERE steamId = ?
    `,
        [steamId],
      );
      const tradeUrl = row[0]?.tradeUrl;

      if (!tradeUrl) {
        return { satatus: 'tradeurl-not-provided' };
      }

      const { data } = await this.validateTradeholdAndUrl({
        steamId,
        tradeUrl,
      });

      if (data.tradelinkInvalid) {
        return { satatus: 'tradeurl-not-provided' };
      }
      return {
        ...data,
        status: 'success',
      };
    } catch (error) {
      //need statuses from ms to handle errors
      return { satatus: 'tradeurl-not-provided' };
    }
  }

  async validateTradeholdAndUrl(query: Record<string, string>) {
    const { url, method } = ENDPOINTS.get('get-tradehold');
    const params = qs.stringify(query, { addQueryPrefix: true });
    return this.fetchSteamMicroservice(url.concat(params), method);
  }

  async fetchInventory(params?: string) {
    const { url, method } = ENDPOINTS.get('get-inventory');
    return this.fetchSteamMicroservice(url.concat(params ?? ''), method);
  }

  async getBotAccountBySteamId(botSteamId: string) {
    const { url, method } = ENDPOINTS.get('get-bot-account');
    return this.fetchSteamMicroservice(url.concat(`/${botSteamId}`), method);
  }

  async validateItems(payload) {
    const { url, method } = ENDPOINTS.get('validate-inventory');
    const transportObj = { ...payload, type: 'trade' };
    return this.fetchSteamMicroservice(url, method, transportObj);
  }

  async manageTrade(body: any) {
    console.log(body);
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
