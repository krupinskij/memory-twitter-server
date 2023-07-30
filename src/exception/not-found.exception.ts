import HttpException from './http.exception';
import { HttpStatus } from './model';

export default class NotFoundException extends HttpException {
  constructor(message: string, verbose: boolean = true) {
    super(message, HttpStatus.NOT_FOUND, false, verbose);
  }
}
