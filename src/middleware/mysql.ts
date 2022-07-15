import { Response, NextFunction } from 'express';
import { Connection } from 'mysql2/promise';

import { Request } from '../model';

const mysql =
  (mysqlConnection: Promise<Connection>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    req.mysql = await mysqlConnection;
    next();
  };

export default mysql;
