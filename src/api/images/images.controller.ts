import path from 'path';

import { Request, Response } from '../../model';

const stop = async (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../assets/images/stop.jpg'));
};

export default {
  stop,
};
