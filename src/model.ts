import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as core from 'express-serve-static-core';
import { RedisClientType } from 'redis';
import { TwitterApi } from 'twitter-api-v2';

export interface Request<ReqBody = any, ReqParams = core.ParamsDictionary>
  extends ExpressRequest<ReqParams, any, ReqBody, qs.ParsedQs, Record<string, any>> {
  twitter?: TwitterApi;
  redis?: RedisClientType;
}

export interface Response<ResBody = any>
  extends ExpressResponse<ResBody | RequestError, Record<string, any>> {}

export interface RequestError {
  message: string;
  stack?: string;
  authRetry?: boolean;
}

export type User = {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
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
