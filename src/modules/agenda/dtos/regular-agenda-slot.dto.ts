import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgendaSlotDto } from './agenda-slot.dto';

export class RegularAgendaSlotDto extends AgendaSlotDto {
  @ApiPropertyOptional({
    description: 'Participants limit for the slot',
    example: 50,
  })
  participantsLimit?: number;

  @ApiPropertyOptional({
    description: 'Agenda item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  agendaItemId?: string;
}
