import { MapLevel, Request, Response } from '../../model';
import { getRandomIndexes, isValidLevel } from '../../utils';
import { QueryLevel } from './user.model';
import userService from './user.service';

const me = async (req: Request, res: Response) => {
  try {
    const me = await userService.me(req);
    res.send(me);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getFollowings = async (req: Request<any, QueryLevel>, res: Response) => {
  try {
    const { level } = req.query;

    if (!isValidLevel(level)) {
      throw new Error('Nie ma takiego levela');
    }

    const followingsToRead = MapLevel[level];

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, true);
    const followingsLength = followings.length;

    if (followingsLength < followingsToRead) {
      throw new Error('Za mało obserwowanych');
    }

    const randomIndexes = getRandomIndexes(followingsToRead, followingsLength);
    const filteredFollowings = randomIndexes.map((index) => followings[index]);

    res.send(filteredFollowings);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export default { me, getFollowings };
