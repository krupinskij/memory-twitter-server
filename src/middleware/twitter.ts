import { Response, NextFunction } from 'express';
import { TwitterApi } from 'twitter-api-v2';

import config from '../config';
import { Request } from '../model';

const twitter = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies['access-token'];
  const refreshToken = req.cookies['refresh-token'];

  if (!accessToken && !refreshToken) {
    return res.status(401).send('Invalid token');
  }

  if (!accessToken) {
    const client = new TwitterApi({
      clientId: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
    });
    const {
      client: refreshedClient,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await client.refreshOAuth2Token(refreshToken as string);

    req.twitter = refreshedClient;
    res
      .cookie('access-token', newAccessToken, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: true,
      })
      .cookie('refresh-token', newRefreshToken, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      });
  } else {
    req.twitter = new TwitterApi(accessToken);
  }

  next();
};

export default twitter;
