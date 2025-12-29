import { UnauthorizedException } from '@nestjs/common';

export class MissingTokenException extends UnauthorizedException {
  constructor(...errors: string[]) {
    super(errors, 'error.missingToken');
  }
}
