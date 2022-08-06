import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import { createConnection } from 'mysql2/promise';
import { createClient, RedisClientType } from 'redis';

import auth from './api/auth';
import images from './api/images';
import result from './api/result';
import tweet from './api/tweet';
import user from './api/user';
import config from './config';
import canvas from './middleware/canvas';
import mysql from './middleware/mysql';
import redis from './middleware/redis';
import twitter from './middleware/twitter';
import { User } from './model';

declare module 'express-session' {
  interface SessionData {
    oauthToken?: string;
    oauthTokenSecret?: string;
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

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    load: 'languageOnly',
    ns: ['errors', 'tweet'],
    backend: {
      loadPath: './src/translations/{{lng}}/{{ns}}.json',
      crossDomain: true,
    },
    detection: {
      order: ['header'],
    },
  });

const app = express();

app.use(json());
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
app.use(middleware.handle(i18next));

app.use('/api/auth', auth);
app.use('/api/images', images);

app.use(twitter);

app.use('/api/result', result);
app.use('/api/user', user);

app.use(canvas);

app.use('/api/tweet', tweet);

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
