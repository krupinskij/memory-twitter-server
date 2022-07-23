import HttpException from './http.exception';
import { HttpStatus } from './model';

export default class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, false);
  }
}
