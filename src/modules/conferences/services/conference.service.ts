import { Injectable } from '@nestjs/common';
import { ConferencesRepository } from '../repositories/conference.repository';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';
import { HostsRepository } from '../repositories/host.repository';
import { HostNotExistsException } from '@/shared/exceptions/host-not-exists.exception';
import {
  conferenceNotExistsMessage,
  fromDateAfterToDateMessage,
  hostNotExistsMessage,
} from '@/shared/constants/exception-messages';
import { WrongDatesException } from '@/shared/exceptions/wrong-dates.exception';
import { ConferenceNotExistsException } from '@/shared/exceptions/conference-not-exists.exception';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';

@Injectable()
export class ConferenceService {
  constructor(
    private readonly conferenceRepository: ConferencesRepository,
    private readonly hostsRepository: HostsRepository,
  ) {}

  async getAsync(id: string): Promise<ConferenceDetailsDto | null> {
    const conference = await this.conferenceRepository.getAsync(id);

    return conference;
  }

  async browseAsync(): Promise<readonly ConferenceDetailsDto[]> {
    return await this.conferenceRepository.browseAsync();
  }

  async addAsync(dto: ConferenceCreateDto): Promise<void> {
    const hostExists = await this.hostsRepository.getAsync(dto.hostId);

    if (!hostExists) {
      throw new HostNotExistsException(hostNotExistsMessage);
    }

    if (dto.from >= dto.to) {
      throw new WrongDatesException(fromDateAfterToDateMessage);
    }

    await this.conferenceRepository.addAsync(dto);
  }

  async updateAsync(dto: ConferenceUpdateDto): Promise<void> {
    const conferenceExists = await this.conferenceRepository.getAsync(dto.id);

    if (!conferenceExists) {
      throw new ConferenceNotExistsException(conferenceNotExistsMessage);
    }
    if (dto.hostId) {
      const hostExists = await this.hostsRepository.getAsync(dto.hostId);

      if (!hostExists) {
        throw new HostNotExistsException(hostNotExistsMessage);
      }
    }

    if (dto.from && dto.to) {
      if (dto.from >= dto.to) {
        throw new WrongDatesException(fromDateAfterToDateMessage);
      }
    }

    await this.conferenceRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const conferenceExists = await this.conferenceRepository.getAsync(id);

    if (!conferenceExists) {
      throw new ConferenceNotExistsException(conferenceNotExistsMessage);
    }

    await this.conferenceRepository.deleteAsync(id);
  }
}
