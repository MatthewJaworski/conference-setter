import { HostEntity } from '../entities/host.entity';
import { HostDto } from '../dtos/host.dto';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { HostCreateDto } from '../dtos/host-create.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

/**
 * Maps HostEntity to HostDetailsDto (with conferences)
 */
export function hostToDetailsDto(entity: HostEntity): HostDetailsDto {
  return plainToInstance(HostDetailsDto, {
    ...instanceToPlain(entity),
    conferences:
      entity.conferences?.map((conference) => ({
        ...instanceToPlain(conference),
        hostName: entity.name,
      })) ?? [],
  });
}

/**
 * Maps HostCreateDto to HostEntity fields (for creating new hosts)
 */
export function createDtoToHostEntity(dto: HostCreateDto): Omit<HostEntity, 'id' | 'conferences'> {
  return instanceToPlain(dto) as Omit<HostEntity, 'id' | 'conferences'>;
}

/**
 * Maps HostDto to HostEntity fields (excludes conferences relation)
 */
export function dtoToHostEntity(dto: HostDto): Omit<HostEntity, 'conferences'> {
  return instanceToPlain(dto) as Omit<HostEntity, 'conferences'>;
}
