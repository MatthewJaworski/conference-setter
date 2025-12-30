import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';
import {
  createDtoToAgendaTrackEntity,
  agendaTrackToDto,
  updateDtoToAgendaTrackEntity,
} from '@/modules/agenda/mappers/agenda-track.mapper';
import { AgendaTrackEntity } from '../entities/agenda-track.entity';

@Injectable()
export class AgendaTrackRepository extends Repository<AgendaTrackEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(AgendaTrackEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreateAgendaTrackDto): Promise<void> {
    const id = v4();
    const agendaTrackData = createDtoToAgendaTrackEntity(dto);

    const agendaTrackToAdd: AgendaTrackEntity = {
      ...agendaTrackData,
      id,
      version: 0,
    } as AgendaTrackEntity;
    const agendaTrack = this.create(agendaTrackToAdd);
    await this.save(agendaTrack);
  }

  async getAsync(id: string): Promise<AgendaTrackDto | null> {
    const agendaTrack = await this.findOne({
      where: { id },
    });
    if (!agendaTrack) {
      return null;
    }
    return agendaTrackToDto(agendaTrack);
  }

  async browseAsync(): Promise<AgendaTrackDto[]> {
    const agendaTracks = await this.find();
    return agendaTracks.map(agendaTrackToDto);
  }

  async updateAsync(dto: UpdateAgendaTrackDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToAgendaTrackEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
