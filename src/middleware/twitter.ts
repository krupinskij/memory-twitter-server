import { Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';

import config from '../config';
import { Request } from '../model';

const twitter = async (req: Request, res: Response, next: NextFunction) => {
  const { accessToken, accessSecret } = req.session;

  if (!accessToken || !accessSecret) {
    delete req.twitter;
    return next();
  }

  const twitter = new TwitterApi({
    appKey: config.API_KEY,
    appSecret: config.API_KEY_SECRET,
    accessToken,
    accessSecret,
  });
  req.twitter = twitter;

  next();
};

export default twitter;
