import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as core from 'express-serve-static-core';
import { Connection } from 'mysql2/promise';
import { RedisClientType } from 'redis';
import { TwitterApi } from 'twitter-api-v2';

export interface Request<ReqBody = any, ReqQuery = qs.ParsedQs, ReqParams = core.ParamsDictionary>
  extends ExpressRequest<ReqParams, any, ReqBody, ReqQuery, Record<string, any>> {
  twitter?: TwitterApi;
  redis?: RedisClientType;
  mysql?: Connection;
}

export type ResponseBody<BodyType> =
  | {
      data: BodyType;
      message: string;
    }
  | BodyType;

export interface Response<BodyType = any>
  extends ExpressResponse<ResponseBody<BodyType> | RequestError, Record<string, any>> {}

export interface RequestError {
  message: string;
  originMessage?: string;
  verbose: boolean;
  logout?: boolean;
  stack?: string;
}

export type User = {
  id: string;
  un: string;
  nm: string;
  pp?: string;
};

export enum Level {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Legendary = 'legendary',
}

export const MapLevel: Record<Level, number> = {
  [Level.Easy]: 8,
  [Level.Medium]: 12,
  [Level.Hard]: 16,
  [Level.Legendary]: 36,
};
