import { DataSource } from 'typeorm';
import 'dotenv/config';

import Orphanage from '../../../modules/orphanages/infra/typeorm/entities/orphanage';
import User from '../../../modules/users/infra/typeorm/entities/user';
import Image from '../../../modules/images/infra/typeorm/entities/image';

import { createTableOrphanages1602727619066 } from './migrations/1602727619066-create_table_orphanages';
import { createTableImages1602780622021 } from './migrations/1602780622021-create_table_images';
import { createTableUsers1603584669272 } from './migrations/1603584669272-create_table_users';

export const dataSource =
  process.env.NODE_ENV === 'production'
    ? new DataSource({
        type: 'postgres',
        host: process.env.TYPEORM_HOST,
        port: Number(process.env.TYPEORM_PORT),
        password: process.env.TYPEORM_PASSWORD,
        username: process.env.TYPEORM_USERNAME,
        database: process.env.TYPEORM_DATABASE,
        entities: [User, Orphanage, Image],
        migrations: [
          createTableOrphanages1602727619066,
          createTableImages1602780622021,
          createTableUsers1603584669272,
        ],
      })
    : new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5455,
        password: '1234',
        username: 'postgres',
        database: 'postgres',
        entities: [User, Orphanage, Image],
        migrations: [
          createTableOrphanages1602727619066,
          createTableImages1602780622021,
          createTableUsers1603584669272,
        ],
      });
