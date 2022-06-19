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

  REDIS_HOSTNAME: process.env.REDIS_HOSTNAME || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  SESSION_SECRET: process.env.SESSION_SECRET || '',
} as const;

export default config;