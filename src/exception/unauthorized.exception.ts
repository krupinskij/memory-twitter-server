import HttpException from './http.exception';
import { HttpStatus } from './model';

export default class UnauthorizedException extends HttpException {
  constructor(message: string, verbose: boolean = true) {
    super(message, HttpStatus.UNAUTHORIZED, true, verbose);
  }
}
