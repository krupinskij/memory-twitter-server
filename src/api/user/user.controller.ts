import HttpException, { BadRequestException } from '../../exception';
import { MapLevel, Request, Response } from '../../model';
import { getRandomIndexes, isValidLevel } from '../../utils';
import { QueryLevel } from './user.model';
import userService from './user.service';

const me = async (req: Request, res: Response) => {
  try {
    const me = await userService.me(req);
    res.send(me);
  } catch (error: any) {
    const { message, stack } = error;
    if (error instanceof HttpException) {
      return res.status(error.httpStatus).send({ message, logout: false, verbose: false });
    }

    res.status(500).send({
      originMessage: message,
      message: 'Coś się popsuło :/',
      verbose: true,
      stack,
    });
  }
};

const getAvailableLevels = async (req: Request<any, QueryLevel>, res: Response) => {
  try {
    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, true);
    const followingsLength = followings.length;

    const availableLevels = Object.entries(MapLevel)
      .filter(([, reqFollowings]) => followingsLength >= reqFollowings)
      .map(([level]) => level);

    res.send(availableLevels);
  } catch (error: any) {
    const { message, stack, logout, verbose } = error;
    if (error instanceof HttpException) {
      return res.status(error.httpStatus).send({ message, logout, verbose });
    }

    res.status(500).send({
      originMessage: message,
      message: 'Coś się popsuło :/',
      verbose: true,
      stack,
    });
  }
};

const getFollowings = async (req: Request<any, QueryLevel>, res: Response) => {
  try {
    const { level } = req.query;

    if (!isValidLevel(level)) {
      throw new BadRequestException('Nie ma takiego poziomu');
    }

    const followingsToRead = MapLevel[level];

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, true);
    const followingsLength = followings.length;

    if (followingsLength < followingsToRead) {
      throw new BadRequestException('Nie masz wystarczającej liczby obserwowanych');
    }

    const randomIndexes = getRandomIndexes(followingsToRead, followingsLength);
    const filteredFollowings = randomIndexes.map((index) => followings[index]);

    res.send(filteredFollowings);
  } catch (error: any) {
    const { message, stack, logout, verbose } = error;
    if (error instanceof HttpException) {
      return res.status(error.httpStatus).send({ message, logout, verbose });
    }

    res.status(500).send({
      originMessage: message,
      message: 'Coś się popsuło :/',
      verbose: true,
      stack,
    });
  }
};

export default { me, getAvailableLevels, getFollowings };
