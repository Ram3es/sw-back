import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(@Inject('DB_CONNECTION') private conn: any) {}

  async findAll() {
    const [data] = await this.conn.query('SELECT * FROM user');
    console.log(data);
    return data;
  }
}
