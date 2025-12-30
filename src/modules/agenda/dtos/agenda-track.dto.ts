import { ApiProperty } from '@nestjs/swagger';

export class AgendaTrackDto {
  @ApiProperty({ description: 'Agenda track ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Conference ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  conferenceId!: string;

  @ApiProperty({ description: 'Track name', example: 'Main Hall' })
  name!: string;

  @ApiProperty({ description: 'Version number for optimistic locking', example: 0 })
  version!: number;
}
