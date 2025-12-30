import { ConferenceEntity } from '../entities/conference.entity';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

/**
 * Maps ConferenceEntity to ConferenceDetailsDto
 */
export function conferenceToDto(entity: ConferenceEntity): ConferenceDetailsDto {
  return plainToInstance(ConferenceDetailsDto, {
    ...instanceToPlain(entity),
    hostName: entity.host?.name,
  });
}

/**
 * Maps ConferenceCreateDto to ConferenceEntity fields (for creating new conferences)
 */
export function createDtoToConferenceEntity(
  dto: ConferenceCreateDto,
): Omit<ConferenceEntity, 'id' | 'host'> {
  return instanceToPlain(dto) as Omit<ConferenceEntity, 'id' | 'host'>;
}

/**
 * Maps ConferenceUpdateDto to partial ConferenceEntity fields (only provided fields)
 */
export function updatedetailsDtoToConferenceEntity(
  dto: ConferenceUpdateDto,
): Partial<Omit<ConferenceEntity, 'host'>> {
  return instanceToPlain(dto) as Partial<Omit<ConferenceEntity, 'host'>>;
}

/**
 * Maps array of ConferenceEntity to array of ConferenceDetailsDto
 */
export function conferencesToDtos(entities: ConferenceEntity[]): ConferenceDetailsDto[] {
  return entities.map(conferenceToDto);
}
