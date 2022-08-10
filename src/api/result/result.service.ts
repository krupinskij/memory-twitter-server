import { BadRequestException } from '../../exception';
import { Request } from '../../model';
import { QueryLevel } from '../user/user.model';
import { Order, ResultDB } from './result.model';

const findResultById = async (
  req: Request<any, QueryLevel>,
  resultId: string
): Promise<ResultDB> => {
  const { level } = req.query;
  const mysql = req.mysql;
  const t = req.t;

  if (!mysql) {
    throw new BadRequestException(t('errors:error-occured'));
  }

  try {
    const [results] = await mysql.execute<ResultDB[]>(
      `
      SELECT * FROM result_${level} 
      WHERE id = "${resultId}"
    `
    );

    return results[0];
  } catch (err) {
    throw new BadRequestException(t('errors:error-occured'));
  }
};

const findResultsByIds = async (req: Request, userIds: string[]): Promise<ResultDB[]> => {
  const { level, order } = req.query;
  const mysql = req.mysql;
  const t = req.t;

  if (!mysql) {
    throw new BadRequestException(t('errors:error-occured'));
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

  try {
    const [results] = await mysql.execute<ResultDB[]>(
      `
      SELECT * FROM result_${level} 
      WHERE userId IN (${userIds.join(',')})
      ${orderStatement}
      LIMIT 20;
      `
    );

    return results;
  } catch (err) {
    throw new BadRequestException(t('errors:error-occured'));
  }
};

const findResultsByIdsAfterResult = async (
  req: Request,
  userIds: string[],
  result: ResultDB
): Promise<ResultDB[]> => {
  const { level, order } = req.query;
  const mysql = req.mysql;
  const t = req.t;

  if (!mysql) {
    throw new BadRequestException(t('errors:error-occured'));
  }

  let orderStatement = '';
  switch (order) {
    case Order.Clicks:
      orderStatement = `
        AND ( 
          clicks > ${result.clicks} OR 
          (clicks = ${result.clicks} AND time > ${result.time}) OR 
          (clicks = ${result.clicks} AND time = ${result.time} AND createdAt > ${result.createdAt})
        )
        ORDER BY clicks, time, createdAt
      `;
      break;
    case Order.Time:
      orderStatement = `
        AND ( 
          time > ${result.time} OR 
          (time = ${result.time} AND clicks > ${result.clicks}) OR 
          (time = ${result.time} AND clicks = ${result.clicks} AND createdAt > ${result.createdAt})
        )
        ORDER BY time, clicks, createdAt
      `;
      break;
  }

  try {
    const [results] = await mysql.execute<ResultDB[]>(
      `
      SELECT * FROM result_${level} 
      WHERE userId IN (${userIds.join(',')})
      ${orderStatement}
      LIMIT 20;
    `
    );

    return results;
  } catch (err) {
    throw new BadRequestException(t('errors:error-occured'));
  }
};

const setResultTweeted = async (
  req: Request,
  result: ResultDB,
  tweeted: boolean
): Promise<void> => {
  const mysql = req.mysql;
  const t = req.t;

  if (!mysql) {
    throw new BadRequestException(t('errors:error-occured'));
  }

  const { id, level } = result;

  try {
    await mysql.execute(
      `
        UPDATE result_${level}
        SET tweeted = ${tweeted}
        WHERE id = "${id}"
      `
    );
  } catch (err) {
    throw new BadRequestException(t('errors:error-occured'));
  }
};

export default {
  findResultById,
  findResultsByIds,
  findResultsByIdsAfterResult,
  setResultTweeted,
};
