import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ConferenceDetailsDto } from './conference-detials.dto';

export class HostCreateDto {
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
