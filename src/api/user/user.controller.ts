import { Request, Response } from '../../model';
import userService from './user.service';

const me = async (req: Request, res: Response) => {
  try {
    const me = await userService.me(req);
    res.send(me);
  } catch (err) {
    res.status(400).send(err);
  }
};

export default { me };
