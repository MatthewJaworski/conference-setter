import { instanceToPlain } from 'class-transformer';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { SpeakerEntity } from '../entities/speaker.entity';
import { SpeakerDto } from '../dtos/speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';

export function createDtoToSpeakerEntity(dto: CreateSpeakerDto): Omit<SpeakerEntity, 'id'> {
  return instanceToPlain(dto) as Omit<SpeakerEntity, 'id'>;
}

export function speakerToDto(entity: SpeakerEntity): SpeakerDto {
  return instanceToPlain(entity) as SpeakerDto;
}

export function updateDtoToSpeakerEntity(dto: UpdateSpeakerDto): Partial<SpeakerEntity> {
  return instanceToPlain(dto) as Partial<SpeakerEntity>;
}
