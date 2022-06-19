import { Response, NextFunction } from 'express';
import { RedisClientType } from 'redis';

import { Request } from '../model';

const redis =
  (redisClient: RedisClientType) => async (req: Request, res: Response, next: NextFunction) => {
    req.redis = redisClient;
    next();
  };

export default redis;
