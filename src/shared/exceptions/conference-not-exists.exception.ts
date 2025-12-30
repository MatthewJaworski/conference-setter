import { NotFoundException } from '@nestjs/common';

export class ConferenceNotExistsException extends NotFoundException {
  constructor(...errors: string[]) {
    super(errors, 'error.conferenceNotExists');
  }
}
