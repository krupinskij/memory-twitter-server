import fs from 'fs';
import * as PImage from 'pureimage';

import HttpException, { ForbiddenException } from '../../exception';
import { Request, Response } from '../../model';
import resultService from '../result/result.service';
import userService from '../user/user.service';
import tweetService from './tweet.service';

const sendTweet = async (req: Request<any, any, { tweetId: string }>, res: Response) => {
  try {
    const { tweetId } = req.params;
    const t = req.t;
    const twitter = req.twitter;

    if (!twitter) {
      throw new Error('no');
    }

    const me = await userService.me(req);

    const result = await resultService.findResultById(req, tweetId);

    if (result.userId !== me.id) {
      throw new ForbiddenException(t('errors:not-your-result'));
    }

    const image = await tweetService.createImage(req, result);
    // await PImage.encodePNGToStream(image, fs.createWriteStream('result.png'));

    try {
      const mediaId = await twitter.v1.uploadMedia(Buffer.from(image.data), { mimeType: 'png' });
    } catch (err) {
      console.log(err);
    }
    // await twitter.v2.tweet('dupa test test', { media: { media_ids: [mediaId] } });
    res.send();
  } catch (error: any) {
    const { message, stack, logout, verbose } = error;
    if (error instanceof HttpException) {
      return res.status(error.httpStatus).send({ message, logout, verbose });
    }

    res.status(500).send({
      originMessage: message,
      message: req.t('errors:something-happened'),
      verbose: true,
      stack,
    });
  }
};

export default { sendTweet };
