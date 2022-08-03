import dayjs from 'dayjs';

import HttpException, { BadRequestException, UnauthorizedException } from '../../exception';
import { Request, Response } from '../../model';
import userService from '../user/user.service';
import {
  AddResultQuery,
  GetResultQuery,
  IDDB,
  Result,
  ResultDB,
  UserResult,
  Users,
} from './result.model';
import resultService from './result.service';

const addResult = async (req: Request<UserResult, AddResultQuery>, res: Response) => {
  try {
    const { clicks, time } = req.body;
    const { level } = req.query;
    const mysql = req.mysql;
    const t = req.t;

    const me = await userService.me(req);
    if (!me) {
      throw new UnauthorizedException(t('errors:not-logged'));
    }

    if (!mysql) {
      throw new BadRequestException(t('errors:error-occured'));
    }

    const now = dayjs();
    let lastId: string | undefined;
    try {
      await mysql.beginTransaction();
      await mysql.execute('SET @id := UUID_TO_BIN(UUID(), true);');
      await mysql.execute(
        `
        INSERT INTO result_${level}(id, userId, time, clicks, level, createdAt) 
        VALUES(@id, ?, ?, ?, ?, ?)
        `,
        [me.id, time, clicks, level, now.unix()]
      );
      const [data] = await mysql.execute<IDDB[]>('SELECT BIN_TO_UUID(@id) as id;');
      await mysql.commit();
      lastId = data[0]?.id;
    } catch (err) {
      await mysql.rollback();
      throw new BadRequestException(t('errors:error-occured'));
    }

    res.send({ id: lastId });
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

const getResults = async (req: Request<any, GetResultQuery>, res: Response<Result[]>) => {
  try {
    const { users: who, lastItem: lastResultId } = req.query;
    const mysql = req.mysql;
    const t = req.t;

    if (!mysql) {
      throw new BadRequestException(t('errors:error-occured'));
    }

    const me = await userService.me(req);
    const followings = await userService.getFollowings(req, me.id, false);

    const lastResult = lastResultId ? await resultService.findResultById(req, lastResultId) : null;

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

    const ids = users.map((user) => user.id);
    const results = lastResult
      ? await resultService.findResultsByIdsAfterResult(req, ids, lastResult)
      : await resultService.findResultsByIds(req, ids);

    const usersMap = new Map(users.map((user) => [user.id, user]));
    const rankingResults = results.map((result) => {
      const rankingResult: Result = {
        ...result,
        user: usersMap.get(result.userId) || me,
      };
      delete rankingResult.userId;

      return rankingResult;
    });

    res.send(rankingResults);
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

export default { addResult, getResults };
