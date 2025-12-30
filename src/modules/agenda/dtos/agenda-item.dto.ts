import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgendaItemDto {
  @ApiProperty({ description: 'Agenda item ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ description: 'Conference ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  conferenceId!: string;

  @ApiProperty({ description: 'Title of the agenda item', example: 'Opening Keynote' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Description of the agenda item',
    example: 'An introduction to the conference',
  })
  description?: string;

  @ApiProperty({ description: 'Difficulty level', example: 2 })
  level!: number;

  @ApiPropertyOptional({
    description: 'Tags associated with the agenda item',
    type: [String],
    example: ['keynote', 'opening'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'IDs of speakers',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174001'],
  })
  speakerIds?: string[];

  @ApiProperty({ description: 'Version number for optimistic locking', example: 0 })
  version!: number;
}
