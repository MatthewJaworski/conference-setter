import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { PlaceholderAgendaSlotDto } from '../dtos/placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';
import {
  createDtoToPlaceholderAgendaSlotEntity,
  placeholderAgendaSlotToDto,
  updateDtoToPlaceholderAgendaSlotEntity,
} from '@/modules/agenda/mappers/placeholder-agenda-slot.mapper';
import { PlaceholderAgendaSlotEntity } from '../entities/placeholder-agenda-slot.entity';

@Injectable()
export class PlaceholderAgendaSlotRepository extends Repository<PlaceholderAgendaSlotEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PlaceholderAgendaSlotEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreatePlaceholderAgendaSlotDto): Promise<void> {
    const id = v4();
    const placeholderSlotData = createDtoToPlaceholderAgendaSlotEntity(dto);

    const placeholderSlotToAdd: PlaceholderAgendaSlotEntity = {
      ...placeholderSlotData,
      id,
    } as PlaceholderAgendaSlotEntity;
    const placeholderSlot = this.create(placeholderSlotToAdd);
    await this.save(placeholderSlot);
  }

  async getAsync(id: string): Promise<PlaceholderAgendaSlotDto | null> {
    const placeholderSlot = await this.findOne({
      where: { id },
    });
    if (!placeholderSlot) {
      return null;
    }
    return placeholderAgendaSlotToDto(placeholderSlot);
  }

  async browseAsync(): Promise<PlaceholderAgendaSlotDto[]> {
    const placeholderSlots = await this.find();
    return placeholderSlots.map(placeholderAgendaSlotToDto);
  }

  async updateAsync(dto: UpdatePlaceholderAgendaSlotDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToPlaceholderAgendaSlotEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
