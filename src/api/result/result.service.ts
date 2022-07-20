import { Request } from '../../model';
import { Order, ResultDB } from './result.model';

const findResultById = async (req: Request, resultId: string): Promise<ResultDB> => {
  const { level } = req.query;
  const mysql = req.mysql;

  if (!mysql) {
    throw new Error('Nie ma mysqla');
  }

  const [results] = await mysql.execute<ResultDB[]>(
    `
      SELECT BIN_TO_UUID(id) as id, userId, clicks, time, createdAt 
      FROM result_${level} 
      WHERE BIN_TO_UUID(id) = "${resultId}"
    `
  );

  return results[0];
};

const findResultsByIds = async (req: Request, userIds: string[]): Promise<ResultDB[]> => {
  const { level, order } = req.query;
  const mysql = req.mysql;

  if (!mysql) {
    throw new Error('Nie ma mysqla');
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

  const [results] = await mysql.execute<ResultDB[]>(
    `
      SELECT BIN_TO_UUID(id) as id, userId, clicks, time, createdAt 
      FROM result_${level} 
      WHERE userId IN (${userIds.join(',')})
      ${orderStatement}
      LIMIT 20;
    `
  );

  return results;
};

const findResultsByIdsAfterResult = async (
  req: Request,
  userIds: string[],
  result: ResultDB
): Promise<ResultDB[]> => {
  const { level, order } = req.query;
  const mysql = req.mysql;

  if (!mysql) {
    throw new Error('Nie ma mysqla');
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

  const [results] = await mysql.execute<ResultDB[]>(
    `
      SELECT BIN_TO_UUID(id) as id, userId, clicks, time, createdAt 
      FROM result_${level} 
      WHERE userId IN (${userIds.join(',')})
      ${orderStatement}
      LIMIT 20;
    `
  );

  return results;
};

export default {
  findResultById,
  findResultsByIds,
  findResultsByIdsAfterResult,
};
