import { instanceToPlain, plainToInstance } from 'class-transformer';
import { AgendaItemEntity } from '../entities/agenda-item.entity';
import { AgendaItemDto } from '../dtos/agenda-item.dto';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';

export function agendaItemToDto(entity: AgendaItemEntity): AgendaItemDto {
  const plain = instanceToPlain(entity);
  return plainToInstance(AgendaItemDto, plain);
}

export function createDtoToAgendaItemEntity(dto: CreateAgendaItemDto): Partial<AgendaItemEntity> {
  const plain = instanceToPlain(dto);
  return plainToInstance(AgendaItemEntity, plain);
}

export function updateDtoToAgendaItemEntity(dto: UpdateAgendaItemDto): Partial<AgendaItemEntity> {
  const plain = instanceToPlain(dto);
  return plainToInstance(AgendaItemEntity, plain);
}
