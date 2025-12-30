import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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

@Injectable()
export class SpeakerRepository extends Repository<SpeakerEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(SpeakerEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: CreateSpeakerDto): Promise<void> {
    const id = v4();
    const speakerData = createDtoToSpeakerEntity(dto);

    const speakerToAdd: SpeakerEntity = {
      ...speakerData,
      id,
    };
    const speaker = this.create(speakerToAdd);
    await this.save(speaker);
  }

  async getAsync(id: string): Promise<SpeakerDto | null> {
    const speaker = await this.findOne({
      where: { id },
    });
    if (!speaker) {
      return null;
    }
    return speakerToDto(speaker);
  }

  async browseAsync(): Promise<SpeakerDto[]> {
    const speakers = await this.find();
    return speakers.map(speakerToDto);
  }

  async updateAsync(dto: UpdateSpeakerDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = updateDtoToSpeakerEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }

  async getByEmailAsync(email: string): Promise<SpeakerDto | null> {
    const speaker = await this.findOne({
      where: { email },
    });
    if (!speaker) {
      return null;
    }
    return speakerToDto(speaker);
  }
}
