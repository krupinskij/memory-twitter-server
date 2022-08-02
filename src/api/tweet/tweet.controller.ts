import fs from 'fs';
import * as PImage from 'pureimage';

import HttpException from '../../exception';
import { Request, Response } from '../../model';
import tweetService from './tweet.service';

const sendTweet = async (req: Request, res: Response) => {
  try {
    const image = await tweetService.createImage(req);
    await PImage.encodePNGToStream(image, fs.createWriteStream('result.png'));

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
