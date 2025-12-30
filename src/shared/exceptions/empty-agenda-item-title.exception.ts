import { BadRequestException } from '@nestjs/common';
import { emptyAgendaItemTitle } from '../constants/exception-messages';

export class EmptyAgendaItemTitleException extends BadRequestException {
  constructor(id: string) {
    super(emptyAgendaItemTitle(id));
  }
}
