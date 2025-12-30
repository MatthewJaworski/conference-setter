import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { AgendaSlotType } from '../services/agenda.service';

export class CreateAgendaTrackCommand {
  @ApiProperty({ description: 'Track name', example: 'Main Hall' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateAgendaSlotCommand {
  @ApiProperty({ description: 'Agenda track ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaTrackId!: string;

  @ApiProperty({ description: 'Slot type', enum: AgendaSlotType })
  @IsEnum(AgendaSlotType)
  @IsNotEmpty()
  type!: AgendaSlotType;

  @ApiProperty({ description: 'Start time', example: '2024-01-15T09:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ description: 'End time', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  to!: string;

  @ApiPropertyOptional({ description: 'Participants limit', example: 50 })
  @IsInt()
  @Min(1)
  @IsOptional()
  participantsLimit?: number;
}

export class AssignPlaceholderAgendaSlotCommand {
  @ApiProperty({ description: 'Agenda track ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaTrackId!: string;

  @ApiProperty({ description: 'Agenda slot ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaSlotId!: string;

  @ApiProperty({ description: 'Placeholder text', example: 'Coffee Break' })
  @IsString()
  @IsNotEmpty()
  placeholder!: string;
}

export class AssignRegularAgendaSlotCommand {
  @ApiProperty({ description: 'Agenda track ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaTrackId!: string;

  @ApiProperty({ description: 'Agenda slot ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaSlotId!: string;

  @ApiProperty({ description: 'Agenda item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  agendaItemId!: string;
}
