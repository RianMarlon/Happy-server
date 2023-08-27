import { createConnection } from 'typeorm';

process.env.NODE_ENV === 'production'
  ? createConnection()
  : createConnection('test');
