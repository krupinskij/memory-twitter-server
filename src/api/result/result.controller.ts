import dayjs from 'dayjs';

import { Request, Response } from '../../model';
import { QueryLevel, UserResult } from './result.model';

const addResult = async (req: Request<UserResult, QueryLevel>, res: Response) => {
  try {
    const { clicks, time } = req.body;
    const { level } = req.query;
    const { me } = req.session;
    const now = dayjs();

    if (!me) {
      throw new Error('Nie jesteś zalogowany');
    }

    await req.mysql?.execute(
      `INSERT INTO result_${level}(id, userId, time, clicks, createdAt) VALUES(UUID_TO_BIN(UUID(), true), ?, ?, ?, ?)`,
      [me.id, time, clicks, now.unix()]
    );

    res.send();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export default { addResult };
