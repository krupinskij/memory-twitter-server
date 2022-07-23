import { HttpStatus } from './model';

export default class HttpException extends Error {
  constructor(public message: string, public httpStatus: HttpStatus, public authRetry: boolean) {
    super(message);
  }
}
