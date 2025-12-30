import { IRepository } from '@/shared/interfaces/repository/repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SpeakerEntity } from '../entities/speaker.entity';
import { CreateSpeakerDto } from '../dtos/create-speaker.dto';
import {
  createDtoToSpeakerEntity,
  speakerToDto,
  updateDtoToSpeakerEntity,
} from '../mappers/speaker.mapper';
import { SpeakerDto } from '../dtos/speaker.dto';
import { UpdateSpeakerDto } from '../dtos/update-speaker.dto';
import { SearchByEmail } from '@/shared/interfaces/repository/searchByEmail';

@Injectable()
export class SpeakerRepository
  implements IRepository<SpeakerDto, UpdateSpeakerDto, SpeakerDto>, SearchByEmail<SpeakerDto>
{
  constructor(
    @InjectRepository(SpeakerEntity)
    private readonly speakerRepository: Repository<SpeakerEntity>,
  ) {}

  async addAsync(dto: CreateSpeakerDto): Promise<void> {
    const id = v4();
    const speakerData = createDtoToSpeakerEntity(dto);

    const speakerToAdd: SpeakerEntity = {
      ...speakerData,
      id,
    };
    const speaker = this.speakerRepository.create(speakerToAdd);
    await this.speakerRepository.save(speaker);
  }

  async getAsync(id: string): Promise<SpeakerDto | null> {
    const speaker = await this.speakerRepository.findOne({
      where: { id },
    });
    if (!speaker) {
      return null;
    }
    return speakerToDto(speaker);
  }

  async browseAsync(): Promise<SpeakerDto[]> {
    const speakers = await this.speakerRepository.find();
    return speakers.map(speakerToDto);
  }

  async updateAsync(dto: UpdateSpeakerDto): Promise<void> {
    const existing = await this.speakerRepository.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToSpeakerEntity(dto);
    const merged = this.speakerRepository.merge(existing, entityData);
    await this.speakerRepository.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.speakerRepository.delete(id);
  }

  async getByEmailAsync(email: string): Promise<SpeakerDto | null> {
    const speaker = await this.speakerRepository.findOne({
      where: { email },
    });
    if (!speaker) {
      return null;
    }
    return speakerToDto(speaker);
  }
}
