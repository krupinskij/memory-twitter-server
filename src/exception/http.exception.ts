import { HttpStatus } from './model';

export default class HttpException extends Error {
  constructor(
    public message: string,
    public httpStatus: HttpStatus,
    public logout: boolean,
    public verbose: boolean
  ) {
    super(message);
  }
}
