import { MethodNotAllowedException } from '@nestjs/common';

export class CannotDeleteHostException extends MethodNotAllowedException {
  constructor(...errors: string[]) {
    super(errors, 'error.cannotDeleteHost');
  }
}
