import { Injectable, NotFoundException } from '@nestjs/common';
import { AgendaSlotRepository } from '../repositories/agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { CreateAgendaSlotDto } from '../dtos/create-agenda-slot.dto';
import { AgendaSlotDto } from '../dtos/agenda-slot.dto';
import { UpdateAgendaSlotDto } from '../dtos/update-agenda-slot.dto';

@Injectable()
export class AgendaSlotService {
  constructor(private readonly agendaSlotRepository: AgendaSlotRepository) {}

  async getAsync(id: string): Promise<AgendaSlotDto | null> {
    return await this.agendaSlotRepository.getAsync(id);
  }

  async browseAsync(): Promise<AgendaSlotDto[]> {
    return await this.agendaSlotRepository.browseAsync();
  }

  async addAsync(dto: CreateAgendaSlotDto): Promise<void> {
    const fromDate = new Date(dto.from);
    const toDate = new Date(dto.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    await this.agendaSlotRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdateAgendaSlotDto): Promise<void> {
    const existing = await this.agendaSlotRepository.getAsync(dto.id);

    if (!existing) {
      throw new NotFoundException(`Agenda slot ${dto.id} not found.`);
    }

    const fromDate = dto.from ? new Date(dto.from) : new Date(existing.from);
    const toDate = dto.to ? new Date(dto.to) : new Date(existing.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    await this.agendaSlotRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const existing = await this.agendaSlotRepository.getAsync(id);

    if (!existing) {
      throw new NotFoundException(`Agenda slot ${id} not found.`);
    }

    await this.agendaSlotRepository.deleteAsync(id);
  }
}
