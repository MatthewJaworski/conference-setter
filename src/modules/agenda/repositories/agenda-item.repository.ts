import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AgendaItemEntity } from '../entities/agenda-item.entity';
import { v4 } from 'uuid';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { AgendaItemDto } from '../dtos/agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';
import {
  createDtoToAgendaItemEntity,
  agendaItemToDto,
  updateDtoToAgendaItemEntity,
} from '@/modules/agenda/mappers/agenda-item.mapper';

@Injectable()
export class AgendaItemRepository extends Repository<AgendaItemEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AgendaItemEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreateAgendaItemDto): Promise<void> {
    const id = v4();
    const agendaItemData = createDtoToAgendaItemEntity(dto);

    const agendaItemToAdd: AgendaItemEntity = {
      ...agendaItemData,
      id,
      version: 0,
    } as AgendaItemEntity;
    const agendaItem = this.create(agendaItemToAdd);
    await this.save(agendaItem);
  }

  async getAsync(id: string): Promise<AgendaItemDto | null> {
    const agendaItem = await this.findOne({
      where: { id },
    });
    if (!agendaItem) {
      return null;
    }
    return agendaItemToDto(agendaItem);
  }

  async browseAsync(): Promise<AgendaItemDto[]> {
    const agendaItems = await this.find();
    return agendaItems.map(agendaItemToDto);
  }

  async updateAsync(dto: UpdateAgendaItemDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToAgendaItemEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
