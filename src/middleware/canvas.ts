import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as PImage from 'pureimage';

import { Request } from '../model';

const canvas = async (req: Request, res: Response, next: NextFunction) => {
  const fontBold = path.join(__dirname, '../assets/fonts/chirp-bold-web.ttf');
  const fontRegular = path.join(__dirname, '../assets/fonts/chirp-regular-web.ttf');
  const bg = path.join(__dirname, '../assets/images/background.png');

  PImage.registerFont(fontBold, 'ChirpBold', 700, 'normal', 'normal').loadSync();
  PImage.registerFont(fontRegular, 'Chirp', 500, 'normal', 'normal').loadSync();

  const image = PImage.make(1000, 1400, {});
  const context = image.getContext('2d');

  context.fillStyle = '#000';
  context.textAlign = 'center';
  context.textBaseline = 'top';

  const background = await PImage.decodePNGFromStream(fs.createReadStream(bg));
  context.drawImage(background, 0, 0);

  req.canvas = { context, image };

  next();
};

export default canvas;
