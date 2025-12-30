import { Injectable } from '@nestjs/common';
import { HostDto } from '../dtos/host.dto';
import { HostEntity } from '../entities/host.entity';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { createDtoToHostEntity, dtoToHostEntity, hostToDetailsDto } from '../mappers/host.mappers';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { HostCreateDto } from '../dtos/host-create.dto';

@Injectable()
export class HostsRepository extends Repository<HostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(HostEntity, dataSource.createEntityManager());
  }

  async addAsync(dto: HostCreateDto): Promise<void> {
    const id = v4();
    const hostData = createDtoToHostEntity(dto);

    const hostToAdd: HostDto = {
      ...hostData,
      id,
    };
    const host = this.create(hostToAdd);
    await this.save(host);
  }

  async getAsync(id: string): Promise<HostDetailsDto | null> {
    const host = await this.findOne({
      where: { id },
      relations: ['conferences'],
    });
    if (!host) {
      return null;
    }
    return hostToDetailsDto(host);
  }

  async browseAsync(): Promise<HostDetailsDto[]> {
    const hosts = await this.find({ relations: ['conferences'] });
    return hosts.map(hostToDetailsDto);
  }

  async updateAsync(dto: HostDetailsDto): Promise<void> {
    const existing = await this.findOne({
      where: { id: dto.id },
    });
    if (!existing) {
      return;
    }
    const entityData = dtoToHostEntity(dto);
    const merged = this.merge(existing, entityData);
    await this.save(merged);
  }

  async deleteAsync(id: string): Promise<void> {
    await this.delete(id);
  }
}
