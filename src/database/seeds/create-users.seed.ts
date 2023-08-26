import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import User from '../../models/User';

import encryptPassword from '../../utils/encryptPassword';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        first_name: process.env.USER_ADMIN_FIRST_NAME,
        last_name: process.env.USER_ADMIN_LAST_NAME,
        email: process.env.USER_ADMIN_EMAIL,
        password: encryptPassword(process.env.USER_ADMIN_PASSWORD as string),
        verified_email: true,
        admin: true,
      })
      .execute();
  }
}
