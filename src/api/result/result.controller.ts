import { Request, Response } from '../../model';
import { QueryLevel, UserResult } from './result.model';

const addResult = async (req: Request<UserResult, QueryLevel>, res: Response) => {
  try {
    const { clicks, timeElapsed } = req.body;
    const { level } = req.query;
    const { me } = req.session;

    if (!me) {
      throw new Error('Nie jesteś zalogowany');
    }

    await req.mysql?.execute(
      `INSERT INTO result_${level}(id, userId, timeElapsed, clicks) VALUES(UUID_TO_BIN(UUID(), true),?,?,?)`,
      [me.id, timeElapsed, clicks]
    );

    res.send();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export default { addResult };
