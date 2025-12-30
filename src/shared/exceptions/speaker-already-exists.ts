import { ForbiddenException } from '@nestjs/common';

export class SpeakerAlreadyExist extends ForbiddenException {
  constructor(...errors: string[]) {
    super(errors, 'error.speakerAlreadyExist');
  }
}
