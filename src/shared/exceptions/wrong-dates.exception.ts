import { BadRequestException } from '@nestjs/common';

export class WrongDatesException extends BadRequestException {
  constructor(...errors: string[]) {
    super(errors, 'error.wrongDates');
  }
}
