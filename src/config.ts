import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3030,
  ORIGIN: process.env.ORIGIN || '*',
} as const;

export default config;
