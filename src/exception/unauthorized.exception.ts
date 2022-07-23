import HttpException from './http.exception';
import { HttpStatus } from './model';

export default class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED, true);
  }
}
