import dayjs from 'dayjs';

import HttpException, { BadRequestException, UnauthorizedException } from '../../exception';
import { Request, Response } from '../../model';
import userService from '../user/user.service';
import { AddResultQuery, GetResultQuery, Result, UserResult, Users } from './result.model';
import resultService from './result.service';

const addResult = async (req: Request<UserResult, AddResultQuery>, res: Response) => {
  try {
    const { clicks, time } = req.body;
    const { level } = req.query;
    const mysql = req.mysql;

    const me = await userService.me(req);
    if (!me) {
      throw new UnauthorizedException('Nie jesteś zalogowany');
    }

    if (!mysql) {
      throw new BadRequestException('Wystąpił błąd spróbuj za parę minut');
    }

    const now = dayjs();
    try {
      await mysql.execute(
        `
        INSERT INTO result_${level}(id, userId, time, clicks, createdAt) 
        VALUES(UUID_TO_BIN(UUID(), true), ?, ?, ?, ?)
        `,
        [me.id, time, clicks, now.unix()]
      );
    } catch (err) {
      throw new BadRequestException('Wystąpił błąd spróbuj za parę minut');
    }

    res.send();
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

const getResults = async (req: Request<any, GetResultQuery>, res: Response<Result[]>) => {
  try {
    const { users: who, lastItem: lastResultId } = req.query;
    const mysql = req.mysql;

    if (!mysql) {
      throw new BadRequestException('Wystąpił błąd spróbuj za parę minut');
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
      message: 'Coś się popsuło :/',
      verbose: true,
      stack,
    });
  }
};

export default { addResult, getResults };
