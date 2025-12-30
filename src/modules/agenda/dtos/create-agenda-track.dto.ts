import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, MaxLength } from 'class-validator';

export class CreateAgendaTrackDto {
  @ApiProperty({ description: 'Conference ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  conferenceId!: string;

  @ApiProperty({ description: 'Track name', example: 'Main Hall', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
