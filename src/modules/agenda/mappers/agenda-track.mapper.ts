import { AgendaTrackEntity } from '../entities/agenda-track.entity';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';

export function agendaTrackToDto(entity: AgendaTrackEntity): AgendaTrackDto {
  return {
    id: entity.id,
    conferenceId: entity.conferenceId,
    name: entity.name,
    version: entity.version,
  };
}

export function createDtoToAgendaTrackEntity(
  dto: CreateAgendaTrackDto,
): Partial<AgendaTrackEntity> {
  return {
    conferenceId: dto.conferenceId,
    name: dto.name,
  };
}

export function updateDtoToAgendaTrackEntity(
  dto: UpdateAgendaTrackDto,
): Partial<AgendaTrackEntity> {
  const entity: Partial<AgendaTrackEntity> = {};

  if (dto.name !== undefined) {
    entity.name = dto.name;
  }

  return entity;
}
