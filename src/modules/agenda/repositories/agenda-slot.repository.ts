import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CreateAgendaSlotDto } from '../dtos/create-agenda-slot.dto';
import { AgendaSlotDto } from '../dtos/agenda-slot.dto';
import { UpdateAgendaSlotDto } from '../dtos/update-agenda-slot.dto';
import {
  createDtoToAgendaSlotEntity,
  agendaSlotToDto,
  updateDtoToAgendaSlotEntity,
} from '@/modules/agenda/mappers/agenda-slot.mapper';
import { AgendaSlotEntity } from '../entities/agenda-slot.entity';

@Injectable()
export class AgendaSlotRepository extends Repository<AgendaSlotEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AgendaSlotEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreateAgendaSlotDto): Promise<void> {
    const id = v4();
    const agendaSlotData = createDtoToAgendaSlotEntity(dto);

    const agendaSlotToAdd: AgendaSlotEntity = {
      ...agendaSlotData,
      id,
    } as AgendaSlotEntity;
    const agendaSlot = this.create(agendaSlotToAdd);
    await this.save(agendaSlot);
  }

  async getAsync(id: string): Promise<AgendaSlotDto | null> {
    const agendaSlot = await this.findOne({
      where: { id },
    });
    if (!agendaSlot) {
      return null;
    }
    return agendaSlotToDto(agendaSlot);
  }

  async browseAsync(): Promise<AgendaSlotDto[]> {
    const agendaSlots = await this.find();
    return agendaSlots.map(agendaSlotToDto);
  }

  async updateAsync(dto: UpdateAgendaSlotDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToAgendaSlotEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
