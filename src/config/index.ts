import 'dotenv/config';

export default {
  NODE_ENV: process.env.NODE_ENV || 'test',
  API_URL: process.env.API_URL as string,
  AUTH_SECRET: process.env.AUTH_SECRET as string,
  AUTH_SECRET_CONFIRM_EMAIL: process.env.AUTH_SECRET_CONFIRM_EMAIL as string,
  TYPEORM_PORT: process.env.TYPEORM_PORT as string,
  TYPEORM_USERNAME: process.env.TYPEORM_USERNAME as string,
  TYPEORM_PASSWORD: process.env.TYPEORM_PASSWORD as string,
  TYPEORM_DATABASE: process.env.TYPEORM_DATABASE as string,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER as string,
  MAIL_HOST: process.env.MAIL_HOST as string,
  MAIL_PORT: process.env.MAIL_PORT as string,
  MAIL_USER: process.env.MAIL_USER as string,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD as string,
  MAIL_URL: process.env.MAIL_URL as string,
  BUCKET_NAME: process.env.BUCKET_NAME as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
};
