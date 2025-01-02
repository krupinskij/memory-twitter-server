import HttpException from './http.exception';
import { HttpStatus } from './model';

export default class BadRequestException extends HttpException {
  constructor(message: string, verbose: boolean = true) {
    super(message, HttpStatus.FORBIDDEN, false, verbose);
  }
}
