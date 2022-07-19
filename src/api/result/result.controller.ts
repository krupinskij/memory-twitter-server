import dayjs from 'dayjs';

import { Request, Response } from '../../model';
import userService from '../user/user.service';
import {
  AddResultQuery,
  GetResultQuery,
  Order,
  Result,
  ResultDB,
  UserResult,
  Users,
} from './result.model';

const addResult = async (req: Request<UserResult, AddResultQuery>, res: Response) => {
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

const getResults = async (req: Request<any, GetResultQuery>, res: Response) => {
  try {
    const { level, order, users: who } = req.query;
    const mysql = req.mysql;

    if (!mysql) {
      throw new Error('Nie ma mysqla');
    }

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, false);

    let users = [];
    switch (who) {
      case Users.OnlyMe:
        users = [me];
        break;
      case Users.OnlyFollowings:
        users = followings;
        break;
      case Users.Together:
        users = [...followings, me];
        break;
    }

    let orderStatement = '';
    switch (order) {
      case Order.Clicks:
        orderStatement = 'ORDER BY clicks, time, createdAt';
        break;
      case Order.Time:
        orderStatement = 'ORDER BY time, clicks, createdAt';
        break;
    }

    const usersMap = new Map(users.map((user) => [user.id, user]));
    const ids = users.map((user) => user.id);

    const [results] = await mysql.execute<ResultDB[]>(
      `
        SELECT BIN_TO_UUID(id) as id, userId, clicks, time, createdAt 
        FROM result_${level} 
        WHERE userId IN (${ids.join(',')})
        ${orderStatement}
      `
    );

    const rankingResults = results.map((result) => {
      const rankingResult: Result = {
        ...result,
        user: usersMap.get(result.userId) || me,
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
