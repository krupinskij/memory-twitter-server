import cors from 'cors';
import express from 'express';

import config from './config';

const { ORIGIN, PORT } = config;

const app = express();

app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);

app.listen(PORT, () => {
  console.log(`App started on port ${PORT}`);
});
