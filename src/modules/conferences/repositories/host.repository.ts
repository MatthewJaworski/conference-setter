import { IRepository } from '@/shared/interfaces/repository/repository';
import { Injectable } from '@nestjs/common';
import { HostDto } from '../dtos/host.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HostEntity } from '../entities/host.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { createDtoToHostEntity, dtoToHostEntity, hostToDetailsDto } from '../mappers/host.mappers';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { HostCreateDto } from '../dtos/host-create.dto';

@Injectable()
export class HostsRepository implements IRepository<HostDto, HostDetailsDto, HostDetailsDto> {
  constructor(
    @InjectRepository(HostEntity)
    private readonly hostRepository: Repository<HostEntity>,
  ) {}

  async addAsync(dto: HostCreateDto): Promise<void> {
    const id = v4();
    const hostData = createDtoToHostEntity(dto);

    const hostToAdd: HostDto = {
      ...hostData,
      id,
    };
    const host = this.hostRepository.create(hostToAdd);
    await this.hostRepository.save(host);
  }

  async getAsync(id: string): Promise<HostDetailsDto | null> {
    const host = await this.hostRepository.findOne({
      where: { id },
      relations: ['conferences'],
    });
    if (!host) {
      return null;
    }
    return hostToDetailsDto(host);
  }

  async browseAsync(): Promise<HostDetailsDto[]> {
    const hosts = await this.hostRepository.find({ relations: ['conferences'] });
    return hosts.map(hostToDetailsDto);
  }

  async updateAsync(dto: HostDetailsDto): Promise<void> {
    const existing = await this.hostRepository.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = dtoToHostEntity(dto);
    const merged = this.hostRepository.merge(existing, entityData);
    await this.hostRepository.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.hostRepository.delete(id);
  }
}
