import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaceholderAgendaSlotRepository } from '../repositories/placeholder-agenda-slot.repository';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { CreatePlaceholderAgendaSlotDto } from '../dtos/create-placeholder-agenda-slot.dto';
import { PlaceholderAgendaSlotDto } from '../dtos/placeholder-agenda-slot.dto';
import { UpdatePlaceholderAgendaSlotDto } from '../dtos/update-placeholder-agenda-slot.dto';

@Injectable()
export class PlaceholderAgendaSlotService {
  constructor(private readonly placeholderAgendaSlotRepository: PlaceholderAgendaSlotRepository) {}

  async getAsync(id: string): Promise<PlaceholderAgendaSlotDto | null> {
    return await this.placeholderAgendaSlotRepository.getAsync(id);
  }

  async browseAsync(): Promise<PlaceholderAgendaSlotDto[]> {
    return await this.placeholderAgendaSlotRepository.browseAsync();
  }

  async addAsync(dto: CreatePlaceholderAgendaSlotDto): Promise<void> {
    const fromDate = new Date(dto.from);
    const toDate = new Date(dto.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    await this.placeholderAgendaSlotRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdatePlaceholderAgendaSlotDto): Promise<void> {
    const existing = await this.placeholderAgendaSlotRepository.getAsync(dto.id);

    if (!existing) {
      throw new NotFoundException(`Placeholder agenda slot ${dto.id} not found.`);
    }

    const fromDate = dto.from ? new Date(dto.from) : new Date(existing.from);
    const toDate = dto.to ? new Date(dto.to) : new Date(existing.to);

    if (fromDate >= toDate) {
      throw new WrongDatesException();
    }

    await this.placeholderAgendaSlotRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const existing = await this.placeholderAgendaSlotRepository.getAsync(id);

    if (!existing) {
      throw new NotFoundException(`Placeholder agenda slot ${id} not found.`);
    }

    await this.placeholderAgendaSlotRepository.deleteAsync(id);
  }
}
