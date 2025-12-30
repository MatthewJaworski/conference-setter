import { Injectable, NotFoundException } from '@nestjs/common';
import { AgendaItemRepository } from '../repositories/agenda-item.repository';
import { EmptyAgendaItemTitleException } from '@/shared/exceptions/empty-agenda-item-title.exception';
import { CreateAgendaItemDto } from '../dtos/create-agenda-item.dto';
import { AgendaItemDto } from '../dtos/agenda-item.dto';
import { UpdateAgendaItemDto } from '../dtos/update-agenda-item.dto';

@Injectable()
export class AgendaItemService {
  constructor(private readonly agendaItemRepository: AgendaItemRepository) {}

  async getAsync(id: string): Promise<AgendaItemDto | null> {
    return await this.agendaItemRepository.getAsync(id);
  }

  async browseAsync(): Promise<AgendaItemDto[]> {
    return await this.agendaItemRepository.browseAsync();
  }

  async addAsync(dto: CreateAgendaItemDto): Promise<void> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new EmptyAgendaItemTitleException('new');
    }

    if (dto.level < 1 || dto.level > 6) {
      throw new Error(`Level must be between 1 and 6.`);
    }

    await this.agendaItemRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdateAgendaItemDto): Promise<void> {
    const existing = await this.agendaItemRepository.getAsync(dto.id);

    if (!existing) {
      throw new NotFoundException(`Agenda item ${dto.id} not found.`);
    }

    if (dto.title !== undefined && dto.title.trim().length === 0) {
      throw new EmptyAgendaItemTitleException(dto.id);
    }

    if (dto.level !== undefined && (dto.level < 1 || dto.level > 6)) {
      throw new Error(`Level must be between 1 and 6.`);
    }

    await this.agendaItemRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const existing = await this.agendaItemRepository.getAsync(id);

    if (!existing) {
      throw new NotFoundException(`Agenda item ${id} not found.`);
    }

    await this.agendaItemRepository.deleteAsync(id);
  }
}
