import { BadRequestException } from '../../exception';
import { Request } from '../../model';
import { encodeResultId, mapResult } from '../../utils';
import { Order, ResultDB } from './result.model';

const findResultById = async (req: Request, resultId: string): Promise<ResultDB> => {
  const mysql = req.mysql;
  const t = req.t;

  if (!mysql) {
    throw new BadRequestException(t('errors:error-occured'));
  }

  try {
    const [id, level] = encodeResultId(resultId);
    const [results] = await mysql.execute<ResultDB[]>(
      `
      SELECT * FROM result_${level} 
      WHERE id = "${id}"
    `
    );

    return mapResult(results[0]);
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

    return results.map(mapResult);
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

    return results.map(mapResult);
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

  const { id: resultId, level } = result;
  try {
    const [id] = encodeResultId(resultId);
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
