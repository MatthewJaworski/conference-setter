import { ForbiddenException } from '@nestjs/common';

export class UnexpectedClaimsException extends ForbiddenException {
  constructor(...errors: string[]) {
    super(errors, 'error.unexpectedClaims');
  }
}
