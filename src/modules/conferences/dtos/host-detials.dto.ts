import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { ConferenceDetailsDto } from './conference-detials.dto';

export class HostDetailsDto {
  @ApiProperty({
    description: 'Host unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Host name',
    example: 'Tech Conference Organizers',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({
    description: 'Host description',
    example: 'Leading technology conference organizer since 2010',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of conferences organized by this host',
    type: [ConferenceDetailsDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConferenceDetailsDto)
  @IsOptional()
  conferences?: ConferenceDetailsDto[];
}
