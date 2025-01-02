import { RowDataPacket } from 'mysql2';

import { Level, User } from '../../model';

export type UserResult = {
  time: number;
  clicks: number;
};

export enum Order {
  Clicks = 'clicks',
  Time = 'time',
}

export enum Users {
  Together = 'together',
  OnlyMe = 'onlyme',
  OnlyFollowings = 'onlyfollowings',
}

export type AddResultQuery = {
  level: Level;
};

export type GetResultParam = {
  resultId: string;
};

export type GetResultQuery = {
  level: Level;
  order: Order;
  users: Users;
  lastItem?: string;
};

export type ResultDB = RowDataPacket & {
  id: string;
  userId: string;
  clicks: number;
  time: number;
  level: Level;
  tweeted: boolean;
  createdAt: number;
};

export type Result = Omit<ResultDB, 'userId'> & {
  user: User;
};

export type IDDB = RowDataPacket & {
  id: string;
};
