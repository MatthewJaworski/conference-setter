import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgendaSlotDto } from './agenda-slot.dto';

export class PlaceholderAgendaSlotDto extends AgendaSlotDto {
  @ApiPropertyOptional({
    description: 'Placeholder text for the slot',
    example: 'Coffee Break',
    maxLength: 500,
  })
  placeholder?: string;
}
