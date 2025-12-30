import { Injectable } from '@nestjs/common';
import { SpeakerRepository } from '../repositories/speaker.repository';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';
import { SpeakerDto } from '../dtos/speaker.dto';
import { SpeakerAlreadyExist } from '@/shared/exceptions/speaker-already-exists';
import {
  speakerExistsMessage,
  speakerNotExistsMessage,
} from '@/shared/constants/exception-messages';
import { SpeakerNotExistsException } from '@/shared/exceptions/speaker-not-exists';

@Injectable()
export class SpeakerService {
  constructor(private readonly speakerRepository: SpeakerRepository) {}

  async getAsync(id: string): Promise<SpeakerDto | null> {
    const speaker = await this.speakerRepository.getAsync(id);

    if (!speaker) {
      return null;
    }
    return speaker;
  }

  async browseAsync(): Promise<SpeakerDto[]> {
    return await this.speakerRepository.browseAsync();
  }

  async addAsync(dto: CreateSpeakerDto): Promise<void> {
    const speakerExists = await this.speakerRepository.getByEmailAsync(dto.email);

    if (speakerExists) {
      throw new SpeakerAlreadyExist(speakerExistsMessage);
    }

    await this.speakerRepository.addAsync(dto);
  }

  async updateAsync(dto: UpdateSpeakerDto): Promise<void> {
    const speakerExists = await this.speakerRepository.getAsync(dto.id);
    if (!speakerExists) {
      throw new SpeakerNotExistsException(speakerNotExistsMessage);
    }
    await this.speakerRepository.updateAsync(dto);
  }

  async deleteAsync(id: string): Promise<void> {
    const speakerExists = await this.speakerRepository.getAsync(id);
    if (!speakerExists) {
      throw new SpeakerNotExistsException(speakerNotExistsMessage);
    }
    await this.speakerRepository.deleteAsync(id);
  }
}
