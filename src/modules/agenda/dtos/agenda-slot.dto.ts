import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgendaSlotDto {
  @ApiProperty({ description: 'Agenda slot ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Start time of the slot', example: '2024-01-15T09:00:00Z' })
  from!: Date;

  @ApiProperty({ description: 'End time of the slot', example: '2024-01-15T10:00:00Z' })
  to!: Date;

  @ApiPropertyOptional({
    description: 'Track ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  trackId?: string;
}
