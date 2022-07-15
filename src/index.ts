import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { createConnection } from 'mysql2/promise';
import { createClient, RedisClientType } from 'redis';

import auth from './api/auth';
import user from './api/user';
import config from './config';
import mysql from './middleware/mysql';
import redis from './middleware/redis';
import twitter from './middleware/twitter';
import { User } from './model';

declare module 'express-session' {
  interface SessionData {
    codeVerifier?: string;
    me?: User;
  }
}

const { ORIGIN, PORT } = config;

const connectionPromise = createConnection({
  host: config.MYSQL_HOSTNAME,
  user: config.MYSQL_USER,
  database: config.MYSQL_DATABASE,
  password: config.MYSQL_PASSWORD,
});

const redisClient: RedisClientType = createClient({
  legacyMode: true,
  url: `redis://${config.REDIS_HOSTNAME}:${config.REDIS_PORT}`,
});
redisClient.connect();

const app = express();

app.use(cookieParser());

app.use(
  session({
    secret: config.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.use(mysql(connectionPromise));
app.use(redis(redisClient));

app.use('/api/auth', auth);

app.use(twitter);

app.use('/api/user', user);

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
