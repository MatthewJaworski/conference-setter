import { Injectable, NotFoundException } from '@nestjs/common';
import { AgendaTrackRepository } from '../repositories/agenda-track.repository';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';

@Injectable()
export class AgendaTrackService {
  constructor(private readonly agendaTrackRepository: AgendaTrackRepository) {}

  async getAsync(id: string): Promise<AgendaTrackDto> {
    const track = await this.agendaTrackRepository.getAsync(id);

    if (!track) {
      throw new NotFoundException(`Agenda track with id ${id} not found`);
    }

    return track;
  }

  async browseAsync(conferenceId?: string): Promise<AgendaTrackDto[]> {
    return await this.agendaTrackRepository.browseAsync(conferenceId);
  }

  async addAsync(dto: CreateAgendaTrackDto): Promise<void> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Track name cannot be empty.');
    }

    await this.agendaTrackRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdateAgendaTrackDto): Promise<void> {
    const existing = await this.agendaTrackRepository.getAsync(dto.id);

    if (!existing) {
      throw new NotFoundException(`Agenda track ${dto.id} not found.`);
    }

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new Error('Track name cannot be empty.');
    }

    await this.agendaTrackRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const existing = await this.agendaTrackRepository.getAsync(id);

    if (!existing) {
      throw new NotFoundException(`Agenda track ${id} not found.`);
    }

    await this.agendaTrackRepository.deleteAsync(id);
  }
}
