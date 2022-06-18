import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import * as core from 'express-serve-static-core';
import { TwitterApi } from 'twitter-api-v2';

export interface Request<ReqBody = any, ReqParams = core.ParamsDictionary>
  extends ExpressRequest<ReqParams, any, ReqBody, qs.ParsedQs, Record<string, any>> {
  twitter?: TwitterApi;
}

export interface Response<ResBody = any>
  extends ExpressResponse<ResBody | RequestError, Record<string, any>> {}

export interface RequestError {
  message: string;
  stack?: string;
  authRetry?: boolean;
}
