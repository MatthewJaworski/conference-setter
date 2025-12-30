import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { CreateAgendaSlotDto } from './create-agenda-slot.dto';

export class CreatePlaceholderAgendaSlotDto extends CreateAgendaSlotDto {
  @ApiPropertyOptional({
    description: 'Placeholder text for the slot',
    example: 'Coffee Break',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  placeholder?: string;
}
