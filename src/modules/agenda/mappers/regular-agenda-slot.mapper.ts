import { RegularAgendaSlotEntity } from '../entities/regular-agenda-slot.entity';
import { RegularAgendaSlotDto } from '../dtos/regular-agenda-slot.dto';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';

export function regularAgendaSlotToDto(entity: RegularAgendaSlotEntity): RegularAgendaSlotDto {
  return {
    id: entity.id,
    from: entity.from,
    to: entity.to,
    trackId: entity.trackId,
    participantsLimit: entity.participantsLimit,
    agendaItemId: entity.agendaItemId,
  };
}

export function createDtoToRegularAgendaSlotEntity(
  dto: CreateRegularAgendaSlotDto,
): Partial<RegularAgendaSlotEntity> {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    trackId: dto.trackId,
    participantsLimit: dto.participantsLimit,
    agendaItemId: dto.agendaItemId,
  };
}

export function updateDtoToRegularAgendaSlotEntity(
  dto: UpdateRegularAgendaSlotDto,
): Partial<RegularAgendaSlotEntity> {
  const entity: Partial<RegularAgendaSlotEntity> = {};

  if (dto.from !== undefined) {
    entity.from = new Date(dto.from);
  }
  if (dto.to !== undefined) {
    entity.to = new Date(dto.to);
  }
  if (dto.trackId !== undefined) {
    entity.trackId = dto.trackId;
  }
  if (dto.participantsLimit !== undefined) {
    entity.participantsLimit = dto.participantsLimit;
  }
  if (dto.agendaItemId !== undefined) {
    entity.agendaItemId = dto.agendaItemId;
  }

  return entity;
}
