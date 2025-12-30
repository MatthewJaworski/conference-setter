import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsOptional, IsDateString } from 'class-validator';

export class UpdateAgendaSlotDto {
  @ApiProperty({ description: 'Agenda slot ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional({ description: 'Start time of the slot', example: '2024-01-15T09:00:00Z' })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'End time of the slot', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  trackId?: string;
}
