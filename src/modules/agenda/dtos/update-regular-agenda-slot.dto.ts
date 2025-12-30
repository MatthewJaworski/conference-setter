import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsUUID } from 'class-validator';
import { UpdateAgendaSlotDto } from './update-agenda-slot.dto';

export class UpdateRegularAgendaSlotDto extends UpdateAgendaSlotDto {
  @ApiPropertyOptional({
    description: 'Participants limit for the slot',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  participantsLimit?: number;

  @ApiPropertyOptional({
    description: 'Agenda item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  agendaItemId?: string;
}
