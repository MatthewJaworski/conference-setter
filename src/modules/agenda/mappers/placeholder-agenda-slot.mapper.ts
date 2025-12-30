import { PlaceholderAgendaSlotEntity } from '../entities/placeholder-agenda-slot.entity';
import { PlaceholderAgendaSlotDto } from '../dtos/placeholder-agenda-slot.dto';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';

export function placeholderAgendaSlotToDto(
  entity: PlaceholderAgendaSlotEntity,
): PlaceholderAgendaSlotDto {
  return {
    id: entity.id,
    from: entity.from,
    to: entity.to,
    trackId: entity.trackId,
    placeholder: entity.placeholder,
  };
}

export function createDtoToPlaceholderAgendaSlotEntity(
  dto: CreatePlaceholderAgendaSlotDto,
): Partial<PlaceholderAgendaSlotEntity> {
  return {
    from: new Date(dto.from),
    to: new Date(dto.to),
    trackId: dto.trackId,
    placeholder: dto.placeholder,
  };
}

export function updateDtoToPlaceholderAgendaSlotEntity(
  dto: UpdatePlaceholderAgendaSlotDto,
): Partial<PlaceholderAgendaSlotEntity> {
  const entity: Partial<PlaceholderAgendaSlotEntity> = {};

  if (dto.from !== undefined) {
    entity.from = new Date(dto.from);
  }
  if (dto.to !== undefined) {
    entity.to = new Date(dto.to);
  }
  if (dto.trackId !== undefined) {
    entity.trackId = dto.trackId;
  }
  if (dto.placeholder !== undefined) {
    entity.placeholder = dto.placeholder;
  }

  return entity;
}
