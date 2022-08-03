import fs from 'fs';
import * as client from 'https';
import path from 'path';
import * as PImage from 'pureimage';
import { Bitmap } from 'pureimage/types/bitmap';
import { Context } from 'pureimage/types/context';

import { BadRequestException, UnauthorizedException } from '../../exception';
import { Request } from '../../model';
import { encodeProfilePicture } from '../../utils';
import { ResultDB } from '../result/result.model';
import userService from '../user/user.service';
import { TextInfo } from './tweet.model';

export const createImage = async (req: Request, result: ResultDB): Promise<Bitmap> => {
  const t = req.t;
  if (!req.canvas) {
    throw new BadRequestException(t('errors:not-tweet'));
  }

  const { context, image } = req.canvas;

  const me = await userService.me(req);
  if (!me) {
    throw new UnauthorizedException(t('errors:not-logged'));
  }

  const av = encodeProfilePicture(me.pp);
  const isPng = path.extname(av).toLowerCase() === 'png';
  const avatarStream = (await new Promise((res) => client.get(av, res))) as any;
  const avatar = isPng
    ? await PImage.decodePNGFromStream(avatarStream)
    : await PImage.decodeJPEGFromStream(avatarStream);

  for (let i = 0; i < 400; i++) {
    for (let j = 0; j < 400; j++) {
      const cI = i - 200;
      const cJ = j - 200;
      if (cI * cI + cJ * cJ > 40000) continue;
      image.setPixelRGBA(i + 300, j + 268, avatar.getPixelRGBA(i, j));
    }
  }

  writeText(t('tweet:game-finished', { returnObjects: true }), 75, 730, context);
  writeText(t('tweet:level', { context: result.level, returnObjects: true }), 50, 860, context);
  writeText(
    t('tweet:clicks', { count: result.clicks, clicks: result.clicks, returnObjects: true }),
    50,
    960,
    context
  );
  writeText(t('tweet:time', { time: result.time, returnObjects: true }), 50, 1040, context);

  return image;
};

const writeText = (textInfo: TextInfo[], fontSize: number, height: number, context: Context) => {
  const clicksWidth = textInfo.reduce((acc, part) => {
    context.font = part.bold ? `${fontSize}px ChirpBold` : `${fontSize}px Chirp`;
    const { width } = context.measureText(part.text);

    return acc + width;
  }, (textInfo.length - 1) * 12);

  let xMg = Math.floor((1000 - clicksWidth) / 2);
  textInfo.forEach((part) => {
    context.textAlign = 'left';
    context.font = part.bold ? `${fontSize}px ChirpBold` : `${fontSize}px Chirp`;

    const { width } = context.measureText(part.text);
    context.fillText(part.text, xMg, height);
    xMg += width + 12;
  });
};

export default { createImage };
