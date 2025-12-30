import { AgendaSlotEntity } from '../entities/agenda-slot.entity';
import { AgendaSlotDto } from '../dtos/agenda-slot.dto';
import { CreateAgendaSlotDto } from '../dtos/create-agenda-slot.dto';
import { UpdateAgendaSlotDto } from '../dtos/update-agenda-slot.dto';

export function agendaSlotToDto(entity: AgendaSlotEntity): AgendaSlotDto {
  return {
    id: entity.id,
    from: entity.from,
    to: entity.to,
    trackId: entity.trackId,
  };
}

export function createDtoToAgendaSlotEntity(dto: CreateAgendaSlotDto): Partial<AgendaSlotEntity> {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    trackId: dto.trackId,
  };
}

export function updateDtoToAgendaSlotEntity(dto: UpdateAgendaSlotDto): Partial<AgendaSlotEntity> {
  const entity: Partial<AgendaSlotEntity> = {};

  if (dto.from !== undefined) {
    entity.from = new Date(dto.from);
  }
  if (dto.to !== undefined) {
    entity.to = new Date(dto.to);
  }
  if (dto.trackId !== undefined) {
    entity.trackId = dto.trackId;
  }

  return entity;
}
