import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateAgendaTrackDto {
  @ApiProperty({ description: 'Agenda track ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @ApiPropertyOptional({ description: 'Track name', example: 'Main Hall', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;
}
