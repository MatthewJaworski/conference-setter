import { NotFoundException } from '@nestjs/common';

export class SpeakerNotExistsException extends NotFoundException {
  constructor(...errors: string[]) {
    super(errors, 'error.speakerNotExists');
  }
}
