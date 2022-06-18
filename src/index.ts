import cors from 'cors';
import express from 'express';
import session from 'express-session';

import auth from './api/auth';
import user from './api/user';
import config from './config';
import twitter from './middleware/twitter';

declare module 'express-session' {
  interface SessionData {
    codeVerifier?: string;
  }
}

const { ORIGIN, PORT } = config;

const app = express();

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

app.use('/api/auth', auth);

app.use(twitter);

app.use('/api/user', user);

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
