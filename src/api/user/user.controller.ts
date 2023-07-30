import HttpException, { BadRequestException } from '../../exception';
import { MapLevel, Request, Response, User } from '../../model';
import { getRandomIndexes, isValidLevel } from '../../utils';
import { QueryLevel } from './user.model';
import userService from './user.service';

const me = async (req: Request, res: Response<User>) => {
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
      message: req.t('errors:something-happened'),
      logout: true,
      verbose: true,
      stack,
    });
  }
};

const getAvailableLevels = async (req: Request<any, QueryLevel>, res: Response<string[]>) => {
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
      message: req.t('errors:something-happened'),
      verbose: true,
      stack,
    });
  }
};

const getFollowings = async (req: Request<any, QueryLevel>, res: Response<User[]>) => {
  try {
    const { level } = req.query;
    const t = req.t;

    if (!isValidLevel(level)) {
      throw new BadRequestException(t('errors:no-level'));
    }

    const followingsToRead = MapLevel[level];

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, true);
    const followingsLength = followings.length;

    if (followingsLength < followingsToRead) {
      throw new BadRequestException(t('errors:no-followings'));
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
      message: req.t('errors:something-happened'),
      verbose: true,
      stack,
    });
  }
};

export default { me, getAvailableLevels, getFollowings };
