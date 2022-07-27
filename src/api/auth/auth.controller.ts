import { TwitterApi } from 'twitter-api-v2';

import config from '../../config';
import { Request, Response } from '../../model';
import { mapUser } from '../../utils';

const link = async (req: Request, res: Response<{ url: string }>) => {
  const twitter = new TwitterApi({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
  });

  const { url, codeVerifier } = twitter.generateOAuth2AuthLink(config.CALLBACK, {
    scope: ['tweet.read', 'users.read', 'follows.read', 'offline.access'],
  });

  req.session.codeVerifier = codeVerifier;
  res.send({ url });
};

const callback = async (req: Request, res: Response) => {
  const twitter = new TwitterApi({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
  });

  const { code, state } = req.query;
  const { codeVerifier } = req.session;

  if (!code || !state || !codeVerifier) {
    return res
      .status(400)
      .send({ data: null, message: 'You denied the app or your session expired!' });
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await twitter.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri: config.CALLBACK,
    });

    const twitterAccess = new TwitterApi(accessToken);
    const { data: twitterMe } = await twitterAccess.v2.me({
      'user.fields': ['name', 'profile_image_url'],
    });

    req.session.me = mapUser(twitterMe);
    res
      .cookie('access-token', accessToken, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: true,
      })
      .cookie('refresh-token', refreshToken, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
      })
      .redirect(config.REDIRECT);
  } catch (err) {
    res.status(403).send({ verbose: false, message: 'Invalid verifier or access tokens!' });
  }
};

const logout = async (req: Request, res: Response<true>) => {
  req.session.destroy(() => {});
  res.clearCookie('access-token').clearCookie('refresh-token').send(true);
};

export default {
  link,
  callback,
  logout,
};
