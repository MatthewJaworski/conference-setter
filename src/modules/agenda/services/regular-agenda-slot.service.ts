import { Injectable, NotFoundException } from '@nestjs/common';
import { RegularAgendaSlotRepository } from '../repositories/regular-agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { CreateRegularAgendaSlotDto } from '../dtos/create-regular-agenda-slot.dto';
import { RegularAgendaSlotDto } from '../dtos/regular-agenda-slot.dto';
import { UpdateRegularAgendaSlotDto } from '../dtos/update-regular-agenda-slot.dto';

@Injectable()
export class RegularAgendaSlotService {
  constructor(private readonly regularAgendaSlotRepository: RegularAgendaSlotRepository) {}

  async getAsync(id: string): Promise<RegularAgendaSlotDto | null> {
    return await this.regularAgendaSlotRepository.getAsync(id);
  }

  async browseAsync(): Promise<RegularAgendaSlotDto[]> {
    return await this.regularAgendaSlotRepository.browseAsync();
  }

  async addAsync(dto: CreateRegularAgendaSlotDto): Promise<void> {
    const fromDate = new Date(dto.from);
    const toDate = new Date(dto.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    if (dto.participantsLimit !== undefined && dto.participantsLimit < 1) {
      throw new Error('Participants limit must be at least 1.');
    }

    await this.regularAgendaSlotRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdateRegularAgendaSlotDto): Promise<void> {
    const existing = await this.regularAgendaSlotRepository.getAsync(dto.id);

    if (!existing) {
      throw new NotFoundException(`Regular agenda slot ${dto.id} not found.`);
    }

    const fromDate = dto.from ? new Date(dto.from) : new Date(existing.from);
    const toDate = dto.to ? new Date(dto.to) : new Date(existing.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    if (dto.participantsLimit !== undefined && dto.participantsLimit < 1) {
      throw new Error('Participants limit must be at least 1.');
    }

    await this.regularAgendaSlotRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const existing = await this.regularAgendaSlotRepository.getAsync(id);

    if (!existing) {
      throw new NotFoundException(`Regular agenda slot ${id} not found.`);
    }

    await this.regularAgendaSlotRepository.deleteAsync(id);
  }
}
