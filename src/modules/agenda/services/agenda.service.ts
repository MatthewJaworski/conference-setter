import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AgendaTrackService } from './agenda-track.service';
import { PlaceholderAgendaSlotService } from './placeholder-agenda-slot.service';
import { RegularAgendaSlotService } from './regular-agenda-slot.service';
import { AgendaItemService } from './agenda-item.service';
import { AgendaTrackRepository } from '../repositories/agenda-track.repository';
import { RequestService } from '@/shared/services/request.service';

export enum AgendaSlotType {
  Regular = 'regular',
  Placeholder = 'placeholder',
}

@Injectable()
export class AgendaService {
  constructor(
    private readonly agendaTrackService: AgendaTrackService,
    private readonly placeholderAgendaSlotService: PlaceholderAgendaSlotService,
    private readonly regularAgendaSlotService: RegularAgendaSlotService,
    private readonly agendaItemService: AgendaItemService,
    private readonly agendaTrackRepository: AgendaTrackRepository,
    private readonly requestService: RequestService,
  ) {}

  async assignPlaceholderAgendaSlotAsync(
    agendaTrackId: string,
    agendaSlotId: string,
    placeholder: string,
  ): Promise<void> {
    const agendaTrack = await this.agendaTrackService.getAsync(agendaTrackId);

    if (!agendaTrack) {
      throw new NotFoundException(`Agenda track ${agendaTrackId} not found.`);
    }

    const agendaSlot = await this.placeholderAgendaSlotService.getAsync(agendaSlotId);

    if (!agendaSlot) {
      throw new NotFoundException(`Placeholder agenda slot ${agendaSlotId} not found.`);
    }

    if (agendaSlot.trackId !== agendaTrackId) {
      throw new Error(`Agenda slot ${agendaSlotId} does not belong to track ${agendaTrackId}.`);
    }

    await this.placeholderAgendaSlotService.updateAsync({
      id: agendaSlotId,
      placeholder,
    });
  }

  async assignRegularAgendaSlotAsync(
    agendaTrackId: string,
    agendaSlotId: string,
    agendaItemId: string,
  ): Promise<void> {
    const agendaTrack = await this.agendaTrackService.getAsync(agendaTrackId);

    if (!agendaTrack) {
      throw new NotFoundException(`Agenda track ${agendaTrackId} not found.`);
    }

    const agendaSlot = await this.regularAgendaSlotService.getAsync(agendaSlotId);

    if (!agendaSlot) {
      throw new NotFoundException(`Regular agenda slot ${agendaSlotId} not found.`);
    }

    if (agendaSlot.trackId !== agendaTrackId) {
      throw new Error(`Agenda slot ${agendaSlotId} does not belong to track ${agendaTrackId}.`);
    }

    const agendaItem = await this.agendaItemService.getAsync(agendaItemId);

    if (!agendaItem) {
      throw new NotFoundException(`Agenda item ${agendaItemId} not found.`);
    }

    await this.regularAgendaSlotService.updateAsync({
      id: agendaSlotId,
      agendaItemId,
    });
  }

  async changeAgendaTrackNameAsync(id: string, name: string): Promise<void> {
    const agendaTrack = await this.agendaTrackService.getAsync(id);

    if (!agendaTrack) {
      throw new NotFoundException(`Agenda track ${id} not found.`);
    }

    await this.agendaTrackService.updateAsync({
      id,
      name,
    });
  }

  async createAgendaSlotAsync(
    agendaTrackId: string,
    type: AgendaSlotType,
    from: string,
    to: string,
    participantsLimit?: number,
  ): Promise<void> {
    const agendaTrack = await this.agendaTrackService.getAsync(agendaTrackId);

    if (!agendaTrack) {
      throw new NotFoundException(`Agenda track ${agendaTrackId} not found.`);
    }

    if (type === AgendaSlotType.Regular) {
      await this.regularAgendaSlotService.addAsync({
        from,
        to,
        trackId: agendaTrackId,
        participantsLimit,
      });
    } else if (type === AgendaSlotType.Placeholder) {
      await this.placeholderAgendaSlotService.addAsync({
        from,
        to,
        trackId: agendaTrackId,
      });
    }
  }

  async createAgendaTrackAsync(
    conferenceId: string,
    name: string,
    userId?: string,
    authorization?: string,
  ): Promise<void> {
    // Check if conference exists via HTTP request
    const conference = await this.requestService.get(
      `http://localhost:3000/conference/${conferenceId}`,
      { userId, authorization },
    );

    if (!conference) {
      throw new NotFoundException(`Conference with id ${conferenceId} not found`);
    }

    const exists = await this.agendaTrackRepository.existsAsync(conferenceId);

    if (exists) {
      throw new ConflictException(`Agenda track already exists.`);
    }

    await this.agendaTrackService.addAsync({
      conferenceId,
      name,
    });
  }

  async deleteAgendaTrackAsync(id: string): Promise<void> {
    const agendaTrack = await this.agendaTrackService.getAsync(id);

    if (!agendaTrack) {
      throw new NotFoundException(`Agenda track ${id} not found.`);
    }

    await this.agendaTrackService.deleteAsync(id);
  }
}
