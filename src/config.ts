import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3030,
  ORIGIN: process.env.ORIGIN || '*',

  API_KEY: process.env.API_KEY || '',
  API_KEY_SECRET: process.env.API_KEY_SECRET || '',
  BEARER_TOKEN: process.env.BEARER_TOKEN || '',

  CLIENT_ID: process.env.CLIENT_ID || '',
  CLIENT_SECRET: process.env.CLIENT_SECRET || '',

  CALLBACK: process.env.CALLBACK || '',
  REDIRECT: process.env.REDIRECT || '',

  USERS: process.env.USERS === '*' ? '*' : process.env.USERS?.split(',') || '*',
  STOP: process.env.STOP || '',

  REDIS_HOSTNAME: process.env.REDIS_HOSTNAME || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  SESSION_SECRET: process.env.SESSION_SECRET || '',

  MYSQL_HOSTNAME: process.env.MYSQL_HOSTNAME || 'localhost',
  MYSQL_USER: process.env.MYSQL_USER || 'user',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || '',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || '',
} as const;

export default config;
