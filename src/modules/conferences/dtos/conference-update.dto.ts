import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ConferenceUpdateDto {
  @ApiProperty({
    description: 'Conference unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string;

  @ApiProperty({
    description: 'Host unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  hostId?: string;

  @ApiPropertyOptional({
    description: 'Host name',
    example: 'Tech Conference Host',
  })
  @IsString()
  @IsOptional()
  hostName?: string;

  @ApiProperty({
    description: 'Conference name',
    example: 'Annual Tech Summit 2025',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the conference',
    example: 'Join us for the biggest tech conference of the year...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Conference location',
    example: 'Warsaw, Poland',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  @ApiPropertyOptional({
    description: 'URL to the conference logo',
    example: 'https://example.com/logo.png',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 500,
    minimum: 1,
    maximum: 100000,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100000)
  participantsLimit?: number;

  @ApiProperty({
    description: 'Conference start date and time',
    example: '2025-06-01T09:00:00Z',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  from?: Date;

  @ApiProperty({
    description: 'Conference end date and time',
    example: '2025-06-03T18:00:00Z',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  to?: Date;
}
