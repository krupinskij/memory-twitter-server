import { TwitterApi } from 'twitter-api-v2';

import config from '../../config';
import { Request, Response } from '../../model';
import { mapUserV1 } from '../../utils';

const link = async (req: Request, res: Response<{ url: string }>) => {
  const twitter = new TwitterApi({
    appKey: config.API_KEY,
    appSecret: config.API_KEY_SECRET,
  });

  const { url, oauth_token, oauth_token_secret } = await twitter.generateAuthLink(config.CALLBACK);

  req.session.oauthToken = oauth_token;
  req.session.oauthTokenSecret = oauth_token_secret;

  res.send({ url });
};

const callback = async (req: Request<null, { oauth_verifier: string }>, res: Response) => {
  const { oauth_verifier } = req.query;
  const { oauthToken, oauthTokenSecret } = req.session;

  if (!oauth_verifier || !oauthToken || !oauthTokenSecret) {
    return res
      .status(400)
      .send({ data: null, message: 'You denied the app or your session expired!' });
  }

  try {
    const twitter = new TwitterApi({
      appKey: config.API_KEY,
      appSecret: config.API_KEY_SECRET,
      accessToken: oauthToken,
      accessSecret: oauthTokenSecret,
    });

    const { client, accessToken, accessSecret } = await twitter.login(oauth_verifier);

    const twitterMe = await client.v1.verifyCredentials();

    if (config.USERS !== '*' && !config.USERS.includes(twitterMe.id_str)) {
      return res.redirect(config.STOP);
    }

    req.session.me = mapUserV1(twitterMe);
    req.session.accessToken = accessToken;
    req.session.accessSecret = accessSecret;
    res.redirect(config.REDIRECT);
  } catch (err) {
    res.status(403).send({ verbose: false, message: 'Invalid verifier or access tokens!' });
  }
};

const logout = async (req: Request, res: Response<true>) => {
  req.session.destroy(() => {});
  res.send(true);
};

export default {
  link,
  callback,
  logout,
};
