import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateUser,
  User,
  UserAccount,
  UserBillingAddress,
  UserCryptoWallet,
  UserWithIncludes,
} from './types';
import { PinoLogger } from 'nestjs-pino';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserCryptoWalletDTO } from './dto/create-user-cryptowallet.dto';
import { UpdateUserCryptWalletDTO } from './dto/update-user-cryptowallet.dto';
import { CreatePaymentAccountDTO } from './dto/create-payment-account.dto';
import { UpdatePaymentAccountDTO } from './dto/update-payment-account.dto';
import { CreateBillingAddressDTO } from './dto/create-billing-address.dto';
import { UpdateBillingAddressDTO } from './dto/update-billing-address.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('DB_CONNECTION') private conn: any,
    private readonly logger: PinoLogger,
  ) {}

  async findBySteamId(steamId: string): Promise<User> {
    const [data] = await this.conn.query(
      `SELECT * FROM users WHERE steamId = ?`,
      [steamId],
    );
    return data.length ? data[0] : null;
  }

  async create(user: CreateUser): Promise<void> {
    const { steamId, steamUsername, profileUrl, avatarUrl } = user;
    await this.conn.query(
      `INSERT INTO users (steamId, steamUsername, avatarUrl, profileUrl) VALUES (?, ?, ?, ?)`,
      [steamId, steamUsername, avatarUrl, profileUrl],
    );
  }

  async update(user: User): Promise<void> {
    const { steamId, steamUsername, avatarUrl, profileUrl } = user;
    await this.conn.query(
      `UPDATE users SET steamUsername = ?, avatarUrl = ?, profileUrl = ? WHERE steamId = ?`,
      [steamUsername, avatarUrl, profileUrl, steamId],
    );
  }

  async getUserBalanceHistory(userId: number) {
    try {
      const [history] = await this.conn.query(
        `SELECT
          prevBalance,
          newBalance,
          newBalance-prevBalance AS 'difference',
          operation,
          extra,
          date
        FROM balance_history
        WHERE userId = ?;`,
        [userId],
      );
      return history;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUserDataWithIncludes(steamId: string): Promise<UserWithIncludes> {
    const [rows] = await this.conn.query(
      `
      SELECT
        u.*,
        ba.id AS billingId,
        ba.firstName AS billingFirstName,
        ba.lastName AS billingLastName,
        ba.streetAddress AS billingStreetAddress,
        ba.streetAddress2 AS billingStreetAddress2,
        ba.city AS billingCity,
        ba.province AS billingProvince,
        ba.zip AS billingZip,
        ba.country AS billingCountry
      FROM users u
      LEFT JOIN user_billing_address ba ON u.id = ba.userId
      WHERE u.steamId = ?
    `,
      [steamId],
    );
    const [userRow] = rows;
    if (!rows.length) {
      return null;
    }

    const user: UserWithIncludes = rows.map((row: any) => {
      return {
        id: row.id,
        steamId: row.steamId,
        steamUsername: row.steamUsername,
        avatarUrl: row.avatarUrl,
        profileUrl: row.profileUrl,
        payout: row.payout,
        banned: row.banned,
        balance: row.balance,
        transactionsTotal: row.transactionsTotal,
        tradeUrl: row.tradeUrl,
        notifications: row.notifications,
        active: row.active,
        email: row.email,
        billingAddress: {
          id: row.billingId,
          firstName: row.billingFirstName,
          lastName: row.billingLastName,
          streetAddress: row.billingStreetAddress,
          streetAddress2: row.billingStreetAddress2,
          city: row.billingCity,
          province: row.billingProvince,
          zip: row.billingZip,
          country: row.billingCountry,
        },
      };
    })[0];
    const [cryptoWallets] = await this.conn.query(
      `
      SELECT * FROM user_crypto_wallets WHERE userId = ?
      `,
      [user.id],
    );

    const [accounts] = await this.conn.query(
      `
      SELECT * FROM user_accounts WHERE userId = ?
      `,
      [user.id],
    );

    return {
      ...user,
      cryptoWallets,
      accounts,
    };
  }

  async updateUserSettings(steamId: string, body: UpdateUserDTO) {
    try {
      let sql = 'UPDATE users SET ';
      const params = [];

      // Create sql query and params array
      for (const key in body) {
        if (body.hasOwnProperty(key)) {
          sql += `${key} = ?, `;
          params.push(body[key]);
        }
      }

      // Slice last , and add WHERE
      sql = sql.slice(0, -2) + ' WHERE steamId = ?';
      params.push(steamId);

      // Run sql query
      await this.conn.query(sql, params);

      const [user] = await this.conn.query(
        `
          SELECT * FROM users WHERE steamId = ?
        `,
        [steamId],
      );

      return user[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async createCryptoWallet(
    steamId: string,
    body: CreateUserCryptoWalletDTO,
  ): Promise<UserCryptoWallet> {
    const { wallet, currency } = body;
    try {
      const data = await this.conn.query(
        `
          INSERT INTO user_crypto_wallets (userId, wallet, currency)
          SELECT id, ?, ?
          FROM users
          WHERE steamId = ?;
        `,
        [wallet, currency, steamId],
      );
      const [walletData] = await this.conn.query(
        `
          SELECT * FROM user_crypto_wallets WHERE id = ?
        `,
        [data[0].insertId],
      );
      return walletData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateCryptoWallet(
    steamId: string,
    body: UpdateUserCryptWalletDTO,
  ): Promise<UserCryptoWallet> {
    const { wallet, id } = body;
    try {
      await this.conn.query(
        `
          UPDATE user_crypto_wallets
          SET wallet = ?
          WHERE userId = (SELECT id FROM users WHERE steamId = ?) AND id = ?;
        `,
        [wallet, steamId, id],
      );
      const [walletData] = await this.conn.query(
        `
          SELECT * FROM user_crypto_wallets WHERE id = ?
        `,
        [id],
      );
      return walletData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async createPaymentAccount(
    steamId: string,
    body: CreatePaymentAccountDTO,
  ): Promise<UserAccount> {
    const { accountType, accountNumber } = body;
    try {
      const data = await this.conn.query(
        `
          INSERT INTO user_accounts (userId, accountType, accountNumber)
          SELECT id, ?, ?
          FROM users
          WHERE steamId = ?;
        `,
        [accountType, accountNumber, steamId],
      );
      const [accountData] = await this.conn.query(
        `
          SELECT * FROM user_accounts WHERE id = ?
        `,
        [data[0].insertId],
      );
      return accountData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updatePaymentAccount(
    steamId: string,
    body: UpdatePaymentAccountDTO,
  ): Promise<UserAccount> {
    const { accountNumber, id } = body;
    try {
      await this.conn.query(
        `
          UPDATE user_accounts
          SET accountNumber = ?
          WHERE userId = (SELECT id FROM users WHERE steamId = ?) AND id = ?;
        `,
        [accountNumber, steamId, id],
      );
      const [accountData] = await this.conn.query(
        `
          SELECT * FROM user_accounts WHERE id = ?
        `,
        [id],
      );
      return accountData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async createBillingAddress(
    steamId: string,
    body: CreateBillingAddressDTO,
  ): Promise<UserBillingAddress> {
    const {
      firstName,
      lastName,
      streetAddress,
      streetAddress2,
      city,
      province,
      zip,
      country,
    } = body;
    try {
      const data = await this.conn.query(
        `
          INSERT INTO user_billing_address (userId, firstName, lastName, streetAddress, streetAddress2, city, province, zip, country)
          SELECT id, ?, ?, ?, ?, ?, ?, ?, ?
          FROM users
          WHERE steamId = ?;
        `,
        [
          firstName,
          lastName,
          streetAddress,
          streetAddress2,
          city,
          province,
          zip,
          country,
          steamId,
        ],
      );
      const [billingAddressData] = await this.conn.query(
        `
          SELECT * FROM user_billing_address WHERE id = ?
        `,
        [data[0].insertId],
      );
      return billingAddressData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateBillingAddress(
    steamId: string,
    body: UpdateBillingAddressDTO,
  ): Promise<UserBillingAddress> {
    const {
      id,
      firstName,
      lastName,
      streetAddress,
      streetAddress2,
      city,
      province,
      zip,
      country,
    } = body;
    try {
      await this.conn.query(
        `
          UPDATE user_billing_address
          SET firstName = ?, lastName = ?, streetAddress = ?, streetAddress2 = ?, city = ?, province = ?, zip = ?, country = ?
          WHERE userId = (SELECT id FROM users WHERE steamId = ?) and id = ?;
        `,
        [
          firstName,
          lastName,
          streetAddress,
          streetAddress2,
          city,
          province,
          zip,
          country,
          steamId,
          id,
        ],
      );
      const [billingAddressData] = await this.conn.query(
        `
          SELECT * FROM user_billing_address WHERE userId = ?
        `,
        [steamId],
      );
      return billingAddressData[0];
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }
}
