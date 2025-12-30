import { IRepository } from '@/shared/interfaces/repository/repository';
import { Injectable } from '@nestjs/common';
import { ConferenceEntity } from '../entities/conference.entity';
import { ConferenceDetailsDto } from '../dtos/conference-detials.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  conferencesToDtos,
  conferenceToDto,
  createDtoToConferenceEntity,
  updatedetailsDtoToConferenceEntity,
} from '../mappers/conference.mapper';
import { v4 } from 'uuid';
import { ConferenceUpdateDto } from '../dtos/conference-update.dto';
import { ConferenceCreateDto } from '../dtos/conference-create.dto';

@Injectable()
export class ConferencesRepository implements IRepository<
  ConferenceCreateDto,
  ConferenceUpdateDto,
  ConferenceDetailsDto
> {
  constructor(
    @InjectRepository(ConferenceEntity)
    private readonly conferenceRepository: Repository<ConferenceEntity>,
  ) {}

  async getAsync(id: string): Promise<ConferenceDetailsDto | null> {
    const conference = await this.conferenceRepository.findOne({
      where: { id },
      relations: ['host'],
    });

    if (!conference) {
      return null;
    }

    return conferenceToDto(conference);
  }

  async browseAsync(): Promise<ConferenceDetailsDto[]> {
    const conferences = await this.conferenceRepository.find();
    const conferencesDtos = conferencesToDtos(conferences);
    return conferencesDtos;
  }

  async addAsync(dto: ConferenceCreateDto): Promise<void> {
    const id = v4();
    const entityData = createDtoToConferenceEntity(dto);

    const conferenceToAdd = {
      ...entityData,
      id,
    };

    const conference = this.conferenceRepository.create(conferenceToAdd);
    await this.conferenceRepository.save(conference);
  }

  async updateAsync(dto: ConferenceUpdateDto): Promise<void> {
    const existing = await this.conferenceRepository.findOne({
      where: { id: dto.id },
    });

    // dont need to throw error here, service layer will handle it
    if (!existing) {
      return;
    }

    const entityData = updatedetailsDtoToConferenceEntity(dto);
    const merged = this.conferenceRepository.merge(existing, entityData);
    await this.conferenceRepository.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.conferenceRepository.delete(id);
  }
}
