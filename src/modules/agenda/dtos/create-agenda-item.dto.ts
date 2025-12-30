import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateAgendaItemDto {
  @ApiProperty({ description: 'Conference ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  conferenceId!: string;

  @ApiProperty({
    description: 'Title of the agenda item',
    example: 'Opening Keynote',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Description of the agenda item',
    example: 'An introduction to the conference',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Difficulty level', example: 2, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;

  @ApiPropertyOptional({
    description: 'Tags associated with the agenda item',
    type: [String],
    example: ['keynote', 'opening'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'IDs of speakers',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174001'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  speakerIds?: string[];
}
