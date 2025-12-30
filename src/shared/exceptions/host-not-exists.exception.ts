import { NotFoundException } from '@nestjs/common';

export class HostNotExistsException extends NotFoundException {
  constructor(...errors: string[]) {
    super(errors, 'error.hostNotExists');
  }
}
