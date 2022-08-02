import fs from 'fs';
import * as client from 'https';
import path from 'path';
import * as PImage from 'pureimage';
import { Bitmap } from 'pureimage/types/bitmap';
import { Context } from 'pureimage/types/context';

import { BadRequestException, UnauthorizedException } from '../../exception';
import { Request } from '../../model';
import { encodeProfilePicture } from '../../utils';
import userService from '../user/user.service';
import { TextInfo } from './tweet.model';

export const createImage = async (req: Request): Promise<Bitmap> => {
  if (!req.canvas) {
    throw new BadRequestException('Nie możesz wysłać tweeta');
  }

  const { context, image } = req.canvas;
  const t = req.t;

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

  writeText([{ bold: true, text: "I've finished the game" }], 75, 730, context);
  writeText(
    [
      { bold: false, text: 'on' },
      { bold: true, text: 'easy' },
      { bold: false, text: 'level.' },
    ],
    50,
    860,
    context
  );
  writeText(
    [
      { bold: false, text: "I've made" },
      { bold: true, text: Math.random() + ' clicks' },
    ],
    50,
    960,
    context
  );
  writeText(
    [
      { bold: false, text: 'in' },
      { bold: true, text: '01:43:234.' },
    ],
    50,
    1040,
    context
  );

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
