import dayjs from 'dayjs';
import { RowDataPacket } from 'mysql2';

import { Request, Response } from '../../model';
import userService from '../user/user.service';
import { QueryLevel, Result, ResultDB, UserResult } from './result.model';

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
      `
        INSERT INTO result_${level}(id, userId, time, clicks, createdAt) 
        VALUES(UUID_TO_BIN(UUID(), true), ?, ?, ?, ?)
      `,
      [me.id, time, clicks, now.unix()]
    );

    res.send();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

const getResults = async (req: Request<any, QueryLevel>, res: Response) => {
  try {
    const { level } = req.query;
    const mysql = req.mysql;

    if (!mysql) {
      throw new Error('Nie ma mysqla');
    }

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, false);

    const followingsMap = new Map(followings.map((following) => [following.id, following]));
    followingsMap.set(me.id, me);

    const ids = followings.map((following) => following.id);
    ids.push(me.id);

    const [results] = await mysql.execute<ResultDB[]>(
      `
        SELECT BIN_TO_UUID(id) as id, userId, clicks, time, createdAt 
        FROM result_${level} 
        WHERE userId IN (${ids.join(',')})
      `
    );

    const rankingResults = results.map((result) => {
      const rankingResult: Result = {
        ...result,
        user: followingsMap.get(result.userId) || me,
      };
      delete rankingResult.userId;

      return rankingResult;
    });

    res.send(rankingResults);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

export default { addResult, getResults };
