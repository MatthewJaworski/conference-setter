import { Test, TestingModule } from '@nestjs/testing';
import { HostService } from './host.service';
import { HostsRepository } from '../repositories/host.repository';
import { HostNotExistsException } from '@/shared/exceptions/host-not-exists.exception';
import { CannotDeleteHostException } from '@/shared/exceptions/cannot-delete-host.exception';
import { HostDetailsDto } from '../dtos/host-detials.dto';
import { HostDto } from '../dtos/host.dto';

describe('HostService', () => {
  let service: HostService;
  let hostsRepository: jest.Mocked<HostsRepository>;

  const mockHostWithoutConferences: HostDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Tech Conference Organizers',
    description: 'Leading technology conference organizer since 2010',
    conferences: [],
  };

  const mockHostWithConferences: HostDetailsDto = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'DevOps Events Inc',
    description: 'DevOps conference organizer',
    conferences: [
      {
        id: '123e4567-e89b-12d3-a456-426614174010',
        hostId: '123e4567-e89b-12d3-a456-426614174001',
        hostName: 'DevOps Events Inc',
        name: 'DevOps Summit 2025',
        location: 'Warsaw, Poland',
        logoUrl: 'https://example.com/logo.png',
        participantsLimit: 500,
        from: new Date('2025-06-01T09:00:00Z'),
        to: new Date('2025-06-03T18:00:00Z'),
      },
    ],
  };

  const mockHosts: HostDto[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Tech Conference Organizers',
      description: 'Leading technology conference organizer since 2010',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'DevOps Events Inc',
      description: 'DevOps conference organizer',
    },
  ];

  beforeEach(async () => {
    const mockHostsRepository = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostService,
        {
          provide: HostsRepository,
          useValue: mockHostsRepository,
        },
      ],
    }).compile();

    service = module.get<HostService>(HostService);
    hostsRepository = module.get(HostsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addAsync', () => {
    const hostDto: HostDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'New Host',
      description: 'A new host organization',
    };

    it('should add host successfully', async () => {
      hostsRepository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(hostDto);

      expect(hostsRepository.addAsync).toHaveBeenCalledWith(hostDto);
    });

    it('should add host without description', async () => {
      const hostWithoutDescription: HostDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Host',
      };
      hostsRepository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(hostWithoutDescription);

      expect(hostsRepository.addAsync).toHaveBeenCalledWith(hostWithoutDescription);
    });
  });

  describe('getAsync', () => {
    it('should return host details when found', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithConferences);

      const result = await service.getAsync(mockHostWithConferences.id);

      expect(result).toBeDefined();
      expect(result?.id).toEqual(mockHostWithConferences.id);
      expect(result?.name).toEqual(mockHostWithConferences.name);
      expect(result?.conferences).toHaveLength(1);
      expect(hostsRepository.getAsync).toHaveBeenCalledWith(mockHostWithConferences.id);
    });

    it('should return null when host not found', async () => {
      hostsRepository.getAsync.mockResolvedValue(null);

      const result = await service.getAsync('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return host with empty conferences array when host has no conferences', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithoutConferences);

      const result = await service.getAsync(mockHostWithoutConferences.id);

      expect(result).toBeDefined();
      expect(result?.conferences).toEqual([]);
    });

    it('should map host data correctly to HostDetailsDto', async () => {
      const hostFromRepo = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Host',
        description: 'Test description',
        conferences: [
          {
            id: 'conf-1',
            hostId: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test Conference',
            location: 'Test Location',
            logoUrl: 'https://test.com/logo.png',
            participantsLimit: 100,
            from: new Date('2025-01-01T09:00:00Z'),
            to: new Date('2025-01-02T18:00:00Z'),
          },
        ],
      };
      hostsRepository.getAsync.mockResolvedValue(hostFromRepo as HostDetailsDto);

      const result = await service.getAsync(hostFromRepo.id);

      expect(result?.id).toEqual(hostFromRepo.id);
      expect(result?.name).toEqual(hostFromRepo.name);
      expect(result?.description).toEqual(hostFromRepo.description);
      expect(result?.conferences?.[0].hostName).toEqual(hostFromRepo.name);
    });
  });

  describe('browseAsync', () => {
    it('should return all hosts', async () => {
      hostsRepository.browseAsync.mockResolvedValue(mockHosts);

      const result = await service.browseAsync();

      expect(result).toEqual(mockHosts);
      expect(hostsRepository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no hosts exist', async () => {
      hostsRepository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('updateAsync', () => {
    const updateDto: HostDetailsDto = {
      id: mockHostWithoutConferences.id,
      name: 'Updated Host Name',
      description: 'Updated description',
    };

    it('should update host successfully', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithoutConferences);
      hostsRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(hostsRepository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(hostsRepository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw HostNotExistsException when host does not exist', async () => {
      hostsRepository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(HostNotExistsException);
      expect(hostsRepository.updateAsync).not.toHaveBeenCalled();
    });

    it('should update host with conferences', async () => {
      const updateWithConferences: HostDetailsDto = {
        ...mockHostWithConferences,
        name: 'Updated Name',
      };
      hostsRepository.getAsync.mockResolvedValue(mockHostWithConferences);
      hostsRepository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateWithConferences);

      expect(hostsRepository.updateAsync).toHaveBeenCalledWith(updateWithConferences);
    });
  });

  describe('deleteAsync', () => {
    it('should delete host successfully when host has no conferences', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithoutConferences);
      hostsRepository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockHostWithoutConferences.id);

      expect(hostsRepository.getAsync).toHaveBeenCalledWith(mockHostWithoutConferences.id);
      expect(hostsRepository.deleteAsync).toHaveBeenCalledWith(mockHostWithoutConferences.id);
    });

    it('should throw HostNotExistsException when host does not exist', async () => {
      const id = 'non-existent-id';
      hostsRepository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(HostNotExistsException);
      expect(hostsRepository.deleteAsync).not.toHaveBeenCalled();
    });

    it('should throw CannotDeleteHostException when host has conferences', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithConferences);

      await expect(service.deleteAsync(mockHostWithConferences.id)).rejects.toThrow(
        CannotDeleteHostException,
      );
      expect(hostsRepository.deleteAsync).not.toHaveBeenCalled();
    });

    it('should delete host when conferences array is undefined', async () => {
      const hostWithUndefinedConferences: HostDetailsDto = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Host without conferences prop',
        conferences: undefined,
      };
      hostsRepository.getAsync.mockResolvedValue(hostWithUndefinedConferences);
      hostsRepository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(hostWithUndefinedConferences.id);

      expect(hostsRepository.deleteAsync).toHaveBeenCalledWith(hostWithUndefinedConferences.id);
    });

    it('should delete host when conferences array is empty', async () => {
      hostsRepository.getAsync.mockResolvedValue(mockHostWithoutConferences);
      hostsRepository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockHostWithoutConferences.id);

      expect(hostsRepository.deleteAsync).toHaveBeenCalledWith(mockHostWithoutConferences.id);
    });
  });
});
