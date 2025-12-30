import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class HostDto {
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
}
