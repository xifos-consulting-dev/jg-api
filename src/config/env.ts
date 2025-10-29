import * as dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  BASE_URL: process.env.BASE_URL || 'http//localhost:3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  //db
  DB_URL_PREFIX: process.env.DB_URL_PREFIX,
  DB_URL_BASE: process.env.DB_URL_BASE,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_USER_PASS: process.env.DB_USER_PASS,
};

export const DB_CONNECTION_URL = `${ENV.DB_URL_PREFIX}${ENV.DB_USER}:${ENV.DB_USER_PASS}@${ENV.DB_URL_BASE}`;
