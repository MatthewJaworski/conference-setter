import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { RegularAgendaSlotDto } from '../dtos/regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';
import {
  createDtoToRegularAgendaSlotEntity,
  regularAgendaSlotToDto,
  updateDtoToRegularAgendaSlotEntity,
} from '@/modules/agenda/mappers/regular-agenda-slot.mapper';
import { RegularAgendaSlotEntity } from '../entities/regular-agenda-slot.entity';

@Injectable()
export class RegularAgendaSlotRepository extends Repository<RegularAgendaSlotEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RegularAgendaSlotEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreateRegularAgendaSlotDto): Promise<void> {
    const id = v4();
    const regularSlotData = createDtoToRegularAgendaSlotEntity(dto);

    const regularSlotToAdd: RegularAgendaSlotEntity = {
      ...regularSlotData,
      id,
    } as RegularAgendaSlotEntity;
    const regularSlot = this.create(regularSlotToAdd);
    await this.save(regularSlot);
  }

  async getAsync(id: string): Promise<RegularAgendaSlotDto | null> {
    const regularSlot = await this.findOne({
      where: { id },
    });
    if (!regularSlot) {
      return null;
    }
    return regularAgendaSlotToDto(regularSlot);
  }

  async browseAsync(): Promise<RegularAgendaSlotDto[]> {
    const regularSlots = await this.find();
    return regularSlots.map(regularAgendaSlotToDto);
  }

  async updateAsync(dto: UpdateRegularAgendaSlotDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToRegularAgendaSlotEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
