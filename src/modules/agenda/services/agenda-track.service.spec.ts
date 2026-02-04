import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AgendaTrackService } from './agenda-track.service';
import { AgendaTrackRepository } from '../repositories/agenda-track.repository';
import { AgendaTrackDto } from '../dtos/agenda-track.dto';
import { CreateAgendaTrackDto } from '../dtos/create-agenda-track.dto';
import { UpdateAgendaTrackDto } from '../dtos/update-agenda-track.dto';

describe('AgendaTrackService', () => {
  let service: AgendaTrackService;
  let repository: jest.Mocked<AgendaTrackRepository>;

  const mockAgendaTrack: AgendaTrackDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    conferenceId: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Main Hall',
    version: 0,
  };

  const mockAgendaTracks: AgendaTrackDto[] = [
    mockAgendaTrack,
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      conferenceId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Workshop Room A',
      version: 0,
    },
  ];

  beforeEach(async () => {
    const mockRepository = {
      getAsync: jest.fn(),
      browseAsync: jest.fn(),
      addAsync: jest.fn(),
      updateAsync: jest.fn(),
      deleteAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaTrackService,
        {
          provide: AgendaTrackRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AgendaTrackService>(AgendaTrackService);
    repository = module.get(AgendaTrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAsync', () => {
    it('should return agenda track when found', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaTrack);

      const result = await service.getAsync(mockAgendaTrack.id);

      expect(result).toEqual(mockAgendaTrack);
      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaTrack.id);
    });

    it('should throw NotFoundException when agenda track not found', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.getAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.getAsync(id)).rejects.toThrow(`Agenda track with id ${id} not found`);
    });
  });

  describe('browseAsync', () => {
    it('should return all agenda tracks', async () => {
      repository.browseAsync.mockResolvedValue(mockAgendaTracks);

      const result = await service.browseAsync();

      expect(result).toEqual(mockAgendaTracks);
      expect(repository.browseAsync).toHaveBeenCalled();
    });

    it('should return empty array when no agenda tracks exist', async () => {
      repository.browseAsync.mockResolvedValue([]);

      const result = await service.browseAsync();

      expect(result).toEqual([]);
    });
  });

  describe('addAsync', () => {
    const createDto: CreateAgendaTrackDto = {
      conferenceId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'New Track',
    };

    it('should add agenda track successfully', async () => {
      repository.addAsync.mockResolvedValue(undefined);

      await service.addAsync(createDto);

      expect(repository.addAsync).toHaveBeenCalledWith(createDto);
    });

    it('should throw Error when name is empty', async () => {
      const dtoWithEmptyName: CreateAgendaTrackDto = {
        ...createDto,
        name: '',
      };

      await expect(service.addAsync(dtoWithEmptyName)).rejects.toThrow(
        'Track name cannot be empty.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when name is only whitespace', async () => {
      const dtoWithWhitespaceName: CreateAgendaTrackDto = {
        ...createDto,
        name: '   ',
      };

      await expect(service.addAsync(dtoWithWhitespaceName)).rejects.toThrow(
        'Track name cannot be empty.',
      );
      expect(repository.addAsync).not.toHaveBeenCalled();
    });
  });

  describe('updateAsync', () => {
    const updateDto: UpdateAgendaTrackDto = {
      id: mockAgendaTrack.id,
      name: 'Updated Track Name',
    };

    it('should update agenda track successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaTrack);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(updateDto);

      expect(repository.getAsync).toHaveBeenCalledWith(updateDto.id);
      expect(repository.updateAsync).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when agenda track does not exist', async () => {
      repository.getAsync.mockResolvedValue(null);

      await expect(service.updateAsync(updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateAsync(updateDto)).rejects.toThrow(
        `Agenda track ${updateDto.id} not found.`,
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when name is empty string', async () => {
      const dtoWithEmptyName: UpdateAgendaTrackDto = {
        ...updateDto,
        name: '',
      };
      repository.getAsync.mockResolvedValue(mockAgendaTrack);

      await expect(service.updateAsync(dtoWithEmptyName)).rejects.toThrow(
        'Track name cannot be empty.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should throw Error when name is only whitespace', async () => {
      const dtoWithWhitespaceName: UpdateAgendaTrackDto = {
        ...updateDto,
        name: '   ',
      };
      repository.getAsync.mockResolvedValue(mockAgendaTrack);

      await expect(service.updateAsync(dtoWithWhitespaceName)).rejects.toThrow(
        'Track name cannot be empty.',
      );
      expect(repository.updateAsync).not.toHaveBeenCalled();
    });

    it('should allow update when name is undefined', async () => {
      const dtoWithoutName: UpdateAgendaTrackDto = {
        id: mockAgendaTrack.id,
      };
      repository.getAsync.mockResolvedValue(mockAgendaTrack);
      repository.updateAsync.mockResolvedValue(undefined);

      await service.updateAsync(dtoWithoutName);

      expect(repository.updateAsync).toHaveBeenCalledWith(dtoWithoutName);
    });
  });

  describe('deleteAsync', () => {
    it('should delete agenda track successfully', async () => {
      repository.getAsync.mockResolvedValue(mockAgendaTrack);
      repository.deleteAsync.mockResolvedValue(undefined);

      await service.deleteAsync(mockAgendaTrack.id);

      expect(repository.getAsync).toHaveBeenCalledWith(mockAgendaTrack.id);
      expect(repository.deleteAsync).toHaveBeenCalledWith(mockAgendaTrack.id);
    });

    it('should throw NotFoundException when agenda track does not exist', async () => {
      const id = 'non-existent-id';
      repository.getAsync.mockResolvedValue(null);

      await expect(service.deleteAsync(id)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAsync(id)).rejects.toThrow(`Agenda track ${id} not found.`);
      expect(repository.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
