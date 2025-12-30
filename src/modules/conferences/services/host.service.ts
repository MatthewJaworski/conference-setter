import { Injectable } from '@nestjs/common';
import { HostsRepository } from '../repositories/host.repository';
import {
  hostNotExistsMessage,
  cannotDeleteHostMessage,
} from '@/shared/constants/exception-messages';
import { HostNotExistsException } from '@/shared/exceptions/host-not-exists.exception';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { CannotDeleteHostException } from '@/shared/exceptions/cannot-delete-host.exception';
import { HostDto } from '../dtos/host.dto';

@Injectable()
export class HostService {
  constructor(private readonly hostsRepository: HostsRepository) {}

  async addAsync(dto: HostDto): Promise<void> {
    await this.hostsRepository.addAsync(dto);
  }

  async getAsync(id: string): Promise<HostDetailsDto | null> {
    const host = await this.hostsRepository.getAsync(id);

    if (!host) {
      return null;
    }

    // Map host to HostDetailsDto with conferences
    const hostDetails: HostDetailsDto = {
      id: host.id,
      name: host.name,
      description: host.description,
      conferences:
        host.conferences?.map((conference) => ({
          id: conference.id,
          hostId: conference.hostId,
          hostName: host.name,
          name: conference.name,
          location: conference.location,
          logoUrl: conference.logoUrl,
          participantsLimit: conference.participantsLimit,
          from: conference.from,
          to: conference.to,
        })) ?? [],
    };

    return hostDetails;
  }

  async browseAsync(): Promise<readonly HostDto[]> {
    return await this.hostsRepository.browseAsync();
  }

  async updateAsync(dto: HostDetailsDto): Promise<void> {
    const hostExists = await this.hostsRepository.getAsync(dto.id);

    if (!hostExists) {
      throw new HostNotExistsException(hostNotExistsMessage);
    }

    await this.hostsRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const host = await this.hostsRepository.getAsync(id);

    if (!host) {
      throw new HostNotExistsException(hostNotExistsMessage);
    }

    // Check if host has conferences - cannot delete if it does
    if (host.conferences && host.conferences.length > 0) {
      throw new CannotDeleteHostException(cannotDeleteHostMessage);
    }

    await this.hostsRepository.deleteAsync(id);
  }
}
