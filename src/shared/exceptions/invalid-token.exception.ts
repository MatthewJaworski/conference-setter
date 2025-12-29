import { UnauthorizedException } from '@nestjs/common';

export class InvalidTokenException extends UnauthorizedException {
  constructor(...errors: string[]) {
    super(errors, 'error.invalidToken');
  }
}
