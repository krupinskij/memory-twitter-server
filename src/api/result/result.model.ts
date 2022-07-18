import { RowDataPacket } from 'mysql2';

import { Level, User } from '../../model';

export type UserResult = {
  time: number;
  clicks: number;
};

export type QueryLevel = {
  level: Level;
};

export type ResultDB = RowDataPacket & {
  id: string;
  userId: string;
  clicks: number;
  time: number;
  createdAt: number;
};

export type Result = Omit<ResultDB, 'userId'> & {
  user: User;
};
